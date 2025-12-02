import { ReportData } from './reportSerializer';
import { supabase } from '../lib/supabase';

export interface PowerAutomateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendReportToPowerAutomate(reportData: ReportData): Promise<PowerAutomateResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing');
    return {
      success: false,
      error: 'Configuration error. Please contact admin.',
    };
  }

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-report-email`;

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to send reports',
      };
    }

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: errorData.error || `Server returned ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    return {
      success: result.success || true,
      message: result.message || 'Report successfully sent via email',
    };
  } catch (error) {
    console.error('Error sending to Power Automate:', error);
    return {
      success: false,
      error: 'Failed to send report. Please try again or contact admin.',
    };
  }
}
