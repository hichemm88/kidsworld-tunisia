import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types de base
export type Category = {
  id: string;
  slug: string;
  nom: string;
  emoji: string;
  couleur: string;
  parent_id: string | null;
};

export type Listing = {
  id: string;
  slug: string;
  nom: string;
  description: string;
  category_id: string;
  ville: string;
  quartier: string;
  adresse: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  plan: "free" | "premium";
  is_verified: boolean;
  is_active: boolean;
  age_min: number;
  age_max: number;
  prix_label: string;
  // Depuis la vue listings_with_stats
  category_nom?: string;
  category_emoji?: string;
  category_couleur?: string;
  note_moyenne?: number;
  nb_avis?: number;
};
