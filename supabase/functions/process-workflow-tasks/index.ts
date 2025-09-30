import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowTask {
  task_id: string;
  prospect_id: string;
  task_type: 'email' | 'call' | 'whatsapp' | 'reminder' | 'note';
  title: string;
  description: string;
  scheduled_at: string;
  template_data: any;
  prospect_data: {
    contact_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    whatsapp_number?: string;
    prospect_type: string;
    status: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Démarrage du traitement sécurisé des tâches de workflow...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Nettoyer les verrous expirés d'abord
    const { data: cleanupResult } = await supabase.rpc('cleanup_expired_task_locks');
    if (cleanupResult > 0) {
      console.log(`🧹 ${cleanupResult} verrous expirés nettoyés`);
    }

    // Verrouiller et récupérer les tâches à traiter de façon sécurisée
    const { data: tasksToProcess, error: lockError } = await supabase.rpc('lock_and_process_tasks', { 
      max_tasks: 50 
    });

    if (lockError) {
      console.error('❌ Erreur verrouillage des tâches:', lockError);
      throw lockError;
    }

    console.log(`📋 ${tasksToProcess?.length || 0} tâches verrouillées pour traitement`);

    if (!tasksToProcess || tasksToProcess.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Aucune tâche à traiter',
        processedTasks: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;
    let errorCount = 0;

    // Traiter chaque tâche verrouillée
    for (const task of tasksToProcess as WorkflowTask[]) {
      try {
        console.log(`🎯 Traitement tâche: ${task.title} pour ${task.prospect_data.contact_name}`);
        
        let processed = false;

        // Vérifier les conditions avant traitement
        if (await shouldSkipTask(supabase, task)) {
          console.log(`⏭️ Tâche ignorée (conditions non remplies): ${task.task_id}`);
          
          await supabase.rpc('complete_task_processing', {
            task_id: task.task_id,
            new_status: 'skipped'
          });
          
          continue;
        }

        switch (task.task_type) {
          case 'email':
            processed = await processEmailTask(supabase, task);
            break;
            
          case 'whatsapp':
            processed = await processWhatsAppTask(supabase, task);
            break;
            
          case 'call':
            processed = await processCallTask(supabase, task);
            break;
            
          case 'reminder':
            processed = await processReminderTask(supabase, task);
            break;
            
          default:
            console.log(`⚠️ Type de tâche non supporté: ${task.task_type}`);
            break;
        }

        if (processed) {
          processedCount++;
          console.log(`✅ Tâche traitée: ${task.task_id}`);
        } else {
          errorCount++;
          console.log(`❌ Échec traitement tâche: ${task.task_id}`);
        }

      } catch (taskError) {
        console.error(`❌ Erreur traitement tâche ${task.task_id}:`, taskError);
        errorCount++;
        
        // Marquer la tâche comme échouée de façon sécurisée
        await supabase.rpc('complete_task_processing', {
          task_id: task.task_id,
          new_status: 'failed',
          error_message: taskError instanceof Error ? taskError.message : 'Unknown error'
        });
      }
    }

    console.log(`🎉 Traitement terminé: ${processedCount} succès, ${errorCount} erreurs`);

    return new Response(JSON.stringify({
      success: true,
      processedTasks: processedCount,
      failedTasks: errorCount,
      totalTasks: tasksToProcess.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Vérifier si une tâche doit être ignorée selon les conditions
async function shouldSkipTask(supabase: any, task: WorkflowTask): Promise<boolean> {
  const condition = task.template_data?.condition;
  
  if (!condition) return false;
  
  switch (condition) {
    case 'no_response':
      // Vérifier s'il y a eu une réponse depuis le dernier contact
      const { data: interactions } = await supabase
        .from('prospect_interactions')
        .select('*')
        .eq('prospect_id', task.prospect_id)
        .eq('interaction_type', 'message')
        .order('created_at', { ascending: false })
        .limit(1);
        
      // Si dernière interaction indique une réponse, ignorer
      return interactions && interactions.length > 0 && 
             interactions[0].outcome?.includes('response');
             
    case 'still_no_response':
      // Plus stricte - vérifier qu'il n'y a vraiment aucune réponse
      const { data: allInteractions } = await supabase
        .from('prospect_interactions')
        .select('*')
        .eq('prospect_id', task.prospect_id)
        .neq('interaction_type', 'note');
        
      return allInteractions && allInteractions.some((i: any) => 
        i.outcome?.includes('response') || i.outcome?.includes('interested')
      );
      
    case 'high_priority_only':
      // Seulement pour les prospects haute priorité
      return task.prospect_data.status !== 'qualified' && 
             task.prospect_data.status !== 'interested';
             
    default:
      return false;
  }
}

// Traiter une tâche email
async function processEmailTask(supabase: any, task: WorkflowTask): Promise<boolean> {
  try {
    if (!task.prospect_data.email) {
      console.log(`⚠️ Pas d'email pour le prospect ${task.prospect_data.contact_name}`);
      await supabase.rpc('complete_task_processing', {
        task_id: task.task_id,
        new_status: 'failed',
        error_message: 'Pas d\'adresse email disponible'
      });
      return false;
    }

    // Créer l'interaction dans l'historique
    await supabase.from('prospect_interactions').insert([{
      prospect_id: task.prospect_id,
      interaction_type: 'email',
      subject: task.title,
      content: `Email automatique envoyé via workflow: ${task.description}`,
      outcome: 'sent_automatically',
      completed_at: new Date().toISOString()
    }]);

    // Marquer la tâche comme terminée de façon sécurisée
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'completed'
    });

    // Mettre à jour la date de dernier contact
    await supabase
      .from('prospects')
      .update({ last_contact_at: new Date().toISOString() })
      .eq('id', task.prospect_id);

    return true;
  } catch (error) {
    console.error('Erreur processEmailTask:', error);
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

// Traiter une tâche WhatsApp
async function processWhatsAppTask(supabase: any, task: WorkflowTask): Promise<boolean> {
  try {
    const whatsappNumber = task.prospect_data.whatsapp_number || task.prospect_data.phone;
    
    if (!whatsappNumber) {
      console.log(`⚠️ Pas de numéro WhatsApp pour ${task.prospect_data.contact_name}`);
      await supabase.rpc('complete_task_processing', {
        task_id: task.task_id,
        new_status: 'failed',
        error_message: 'Pas de numéro WhatsApp disponible'
      });
      return false;
    }

    // Créer l'interaction
    await supabase.from('prospect_interactions').insert([{
      prospect_id: task.prospect_id,
      interaction_type: 'message',
      subject: task.title,
      content: `WhatsApp automatique préparé: ${task.description}`,
      outcome: 'whatsapp_prepared',
      completed_at: new Date().toISOString()
    }]);

    // Marquer comme terminé de façon sécurisée
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'completed'
    });

    return true;
  } catch (error) {
    console.error('Erreur processWhatsAppTask:', error);
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

// Traiter une tâche d'appel
async function processCallTask(supabase: any, task: WorkflowTask): Promise<boolean> {
  try {
    // Créer un rappel pour l'agent
    await supabase.from('prospect_interactions').insert([{
      prospect_id: task.prospect_id,
      interaction_type: 'note',
      subject: `Rappel: ${task.title}`,
      content: `Tâche d'appel programmée automatiquement: ${task.description}`,
      outcome: 'reminder_created',
      completed_at: new Date().toISOString()
    }]);

    // Marquer comme terminé de façon sécurisée
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'completed'
    });

    return true;
  } catch (error) {
    console.error('Erreur processCallTask:', error);
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

// Traiter une tâche de rappel
async function processReminderTask(supabase: any, task: WorkflowTask): Promise<boolean> {
  try {
    // Créer une notification pour l'agent
    await supabase.from('prospect_interactions').insert([{
      prospect_id: task.prospect_id,
      interaction_type: 'note',
      subject: task.title,
      content: task.description,
      outcome: 'reminder_executed',
      completed_at: new Date().toISOString()
    }]);

    // Marquer comme terminé de façon sécurisée
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'completed'
    });

    return true;
  } catch (error) {
    console.error('Erreur processReminderTask:', error);
    await supabase.rpc('complete_task_processing', {
      task_id: task.task_id,
      new_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}