import {Injectable, Logger} from '@nestjs/common';
import {createClient, SupabaseClient} from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  public supabase: SupabaseClient;
  private supabaseUrl: string = process.env.SUPABASE_URL;
  private supabaseKey: string = process.env.SUPABASE_KEY;

  private readonly logger = new Logger(SupabaseService.name);

  constructor() {
    if (!this.supabaseUrl || !this.supabaseKey) {
      this.logger.error('Supabase URL and Key are required');
      throw new Error('Supabase URL and Key are required');
    }
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }
}
