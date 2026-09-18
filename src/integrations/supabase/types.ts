export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string;
          created_at: string;
          details: Json | null;
          id: string;
          record_id: string | null;
          table_name: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          record_id?: string | null;
          table_name?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          record_id?: string | null;
          table_name?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      ai_rate_limits: {
        Row: {
          bucket_key: string;
          created_at: string;
          id: string;
          last_request_at: string;
          request_count: number;
          updated_at: string;
          window_start: string;
        };
        Insert: {
          bucket_key: string;
          created_at?: string;
          id?: string;
          last_request_at?: string;
          request_count?: number;
          updated_at?: string;
          window_start: string;
        };
        Update: {
          bucket_key?: string;
          created_at?: string;
          id?: string;
          last_request_at?: string;
          request_count?: number;
          updated_at?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          active_ingredient: string | null;
          brand_name: string;
          composition: string | null;
          created_at: string;
          data_version: string;
          dosage_form: string | null;
          id: string;
          last_verified: string | null;
          manufacturer_id: string | null;
          medicine_id: string | null;
          normalized_brand_name: string;
          reference_id: string | null;
          route: string | null;
          source: string | null;
          strength: string | null;
          updated_at: string;
          verification_status: string;
          verified: boolean;
        };
        Insert: {
          active_ingredient?: string | null;
          brand_name: string;
          composition?: string | null;
          created_at?: string;
          data_version?: string;
          dosage_form?: string | null;
          id?: string;
          last_verified?: string | null;
          manufacturer_id?: string | null;
          medicine_id?: string | null;
          normalized_brand_name: string;
          reference_id?: string | null;
          route?: string | null;
          source?: string | null;
          strength?: string | null;
          updated_at?: string;
          verification_status?: string;
          verified?: boolean;
        };
        Update: {
          active_ingredient?: string | null;
          brand_name?: string;
          composition?: string | null;
          created_at?: string;
          data_version?: string;
          dosage_form?: string | null;
          id?: string;
          last_verified?: string | null;
          manufacturer_id?: string | null;
          medicine_id?: string | null;
          normalized_brand_name?: string;
          reference_id?: string | null;
          route?: string | null;
          source?: string | null;
          strength?: string | null;
          updated_at?: string;
          verification_status?: string;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "brands_manufacturer_id_fkey";
            columns: ["manufacturer_id"];
            isOneToOne: false;
            referencedRelation: "manufacturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "brands_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "brands_reference_id_fkey";
            columns: ["reference_id"];
            isOneToOne: false;
            referencedRelation: "references";
            referencedColumns: ["id"];
          },
        ];
      };
      dosages: {
        Row: {
          age_group: string | null;
          dose: string | null;
          duration: string | null;
          frequency: string | null;
          hepatic_consideration: string | null;
          id: string;
          indication: string | null;
          maximum_dose: string | null;
          medicine_id: string;
          reference_id: string | null;
          renal_adjustment: string | null;
          route: string | null;
          unit: string | null;
        };
        Insert: {
          age_group?: string | null;
          dose?: string | null;
          duration?: string | null;
          frequency?: string | null;
          hepatic_consideration?: string | null;
          id?: string;
          indication?: string | null;
          maximum_dose?: string | null;
          medicine_id: string;
          reference_id?: string | null;
          renal_adjustment?: string | null;
          route?: string | null;
          unit?: string | null;
        };
        Update: {
          age_group?: string | null;
          dose?: string | null;
          duration?: string | null;
          frequency?: string | null;
          hepatic_consideration?: string | null;
          id?: string;
          indication?: string | null;
          maximum_dose?: string | null;
          medicine_id?: string;
          reference_id?: string | null;
          renal_adjustment?: string | null;
          route?: string | null;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "dosages_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dosages_reference_id_fkey";
            columns: ["reference_id"];
            isOneToOne: false;
            referencedRelation: "references";
            referencedColumns: ["id"];
          },
        ];
      };
      drug_classes: {
        Row: {
          advantages: string[] | null;
          atc_code: string | null;
          class_type: string;
          clinical_definition: string | null;
          common_uses: string[] | null;
          contraindications: string[] | null;
          created_at: string;
          disadvantages: string[] | null;
          hindi_explanation: string | null;
          id: string;
          key_adverse_effects: string[] | null;
          key_suffix: string | null;
          mechanism: string | null;
          name: string;
          parent_id: string | null;
          simple_explanation: string | null;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          advantages?: string[] | null;
          atc_code?: string | null;
          class_type?: string;
          clinical_definition?: string | null;
          common_uses?: string[] | null;
          contraindications?: string[] | null;
          created_at?: string;
          disadvantages?: string[] | null;
          hindi_explanation?: string | null;
          id?: string;
          key_adverse_effects?: string[] | null;
          key_suffix?: string | null;
          mechanism?: string | null;
          name: string;
          parent_id?: string | null;
          simple_explanation?: string | null;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          advantages?: string[] | null;
          atc_code?: string | null;
          class_type?: string;
          clinical_definition?: string | null;
          common_uses?: string[] | null;
          contraindications?: string[] | null;
          created_at?: string;
          disadvantages?: string[] | null;
          hindi_explanation?: string | null;
          id?: string;
          key_adverse_effects?: string[] | null;
          key_suffix?: string | null;
          mechanism?: string | null;
          name?: string;
          parent_id?: string | null;
          simple_explanation?: string | null;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drug_classes_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "drug_classes";
            referencedColumns: ["id"];
          },
        ];
      };
      drug_interactions: {
        Row: {
          clinical_significance: string | null;
          description: string;
          id: string;
          mechanism: string | null;
          medicine_a_id: string;
          medicine_b_id: string;
          professional_consideration: string | null;
          reference_id: string | null;
          severity: string;
          verified: boolean;
        };
        Insert: {
          clinical_significance?: string | null;
          description: string;
          id?: string;
          mechanism?: string | null;
          medicine_a_id: string;
          medicine_b_id: string;
          professional_consideration?: string | null;
          reference_id?: string | null;
          severity?: string;
          verified?: boolean;
        };
        Update: {
          clinical_significance?: string | null;
          description?: string;
          id?: string;
          mechanism?: string | null;
          medicine_a_id?: string;
          medicine_b_id?: string;
          professional_consideration?: string | null;
          reference_id?: string | null;
          severity?: string;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "drug_interactions_medicine_a_id_fkey";
            columns: ["medicine_a_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drug_interactions_medicine_b_id_fkey";
            columns: ["medicine_b_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drug_interactions_reference_id_fkey";
            columns: ["reference_id"];
            isOneToOne: false;
            referencedRelation: "references";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards: {
        Row: {
          answer: string;
          class_id: string | null;
          created_at: string;
          difficulty: string;
          id: string;
          medicine_id: string | null;
          question: string;
          topic: string;
        };
        Insert: {
          answer: string;
          class_id?: string | null;
          created_at?: string;
          difficulty?: string;
          id?: string;
          medicine_id?: string | null;
          question: string;
          topic?: string;
        };
        Update: {
          answer?: string;
          class_id?: string | null;
          created_at?: string;
          difficulty?: string;
          id?: string;
          medicine_id?: string | null;
          question?: string;
          topic?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "drug_classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcards_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_progress: {
        Row: {
          activity_type: string;
          completed_at: string;
          id: string;
          item_id: string | null;
          score: number | null;
          topic: string | null;
          total: number | null;
          user_id: string;
        };
        Insert: {
          activity_type: string;
          completed_at?: string;
          id?: string;
          item_id?: string | null;
          score?: number | null;
          topic?: string | null;
          total?: number | null;
          user_id: string;
        };
        Update: {
          activity_type?: string;
          completed_at?: string;
          id?: string;
          item_id?: string | null;
          score?: number | null;
          topic?: string | null;
          total?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      manufacturers: {
        Row: {
          country: string | null;
          created_at: string;
          id: string;
          last_verified: string | null;
          name: string;
          normalized_name: string;
          source: string | null;
          status: string;
          updated_at: string;
          verification_status: string;
          website: string | null;
        };
        Insert: {
          country?: string | null;
          created_at?: string;
          id?: string;
          last_verified?: string | null;
          name: string;
          normalized_name: string;
          source?: string | null;
          status?: string;
          updated_at?: string;
          verification_status?: string;
          website?: string | null;
        };
        Update: {
          country?: string | null;
          created_at?: string;
          id?: string;
          last_verified?: string | null;
          name?: string;
          normalized_name?: string;
          source?: string | null;
          status?: string;
          updated_at?: string;
          verification_status?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      medical_terms: {
        Row: {
          category: string | null;
          clinical_definition: string | null;
          created_at: string;
          definition: string | null;
          hindi_explanation: string | null;
          hinglish_explanation: string | null;
          id: string;
          pronunciation_en: string | null;
          pronunciation_hi: string | null;
          related_medicines: string[] | null;
          related_terms: string[] | null;
          simple_definition: string | null;
          slug: string;
          term: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          clinical_definition?: string | null;
          created_at?: string;
          definition?: string | null;
          hindi_explanation?: string | null;
          hinglish_explanation?: string | null;
          id?: string;
          pronunciation_en?: string | null;
          pronunciation_hi?: string | null;
          related_medicines?: string[] | null;
          related_terms?: string[] | null;
          simple_definition?: string | null;
          slug: string;
          term: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          clinical_definition?: string | null;
          created_at?: string;
          definition?: string | null;
          hindi_explanation?: string | null;
          hinglish_explanation?: string | null;
          id?: string;
          pronunciation_en?: string | null;
          pronunciation_hi?: string | null;
          related_medicines?: string[] | null;
          related_terms?: string[] | null;
          simple_definition?: string | null;
          slug?: string;
          term?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medicine_classifications: {
        Row: {
          class_id: string;
          id: string;
          is_primary: boolean;
          medicine_id: string;
        };
        Insert: {
          class_id: string;
          id?: string;
          is_primary?: boolean;
          medicine_id: string;
        };
        Update: {
          class_id?: string;
          id?: string;
          is_primary?: boolean;
          medicine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medicine_classifications_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "drug_classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medicine_classifications_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
        ];
      };
      medicine_references: {
        Row: {
          id: string;
          medicine_id: string;
          reference_id: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          reference_id: string;
        };
        Update: {
          id?: string;
          medicine_id?: string;
          reference_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medicine_references_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medicine_references_reference_id_fkey";
            columns: ["reference_id"];
            isOneToOne: false;
            referencedRelation: "references";
            referencedColumns: ["id"];
          },
        ];
      };
      medicines: {
        Row: {
          absorption: string | null;
          active_ingredient: string | null;
          advantages: string[] | null;
          bioavailability: string | null;
          category: string | null;
          clearance: string | null;
          common_adverse_effects: string[] | null;
          contraindications: string[] | null;
          created_at: string;
          data_version: string;
          description: string | null;
          disadvantages: string[] | null;
          display_name: string;
          distribution: string | null;
          dosage_forms: string[] | null;
          drug_interactions: string[] | null;
          duration: string | null;
          excretion: string | null;
          food_interactions: string[] | null;
          generic_name: string;
          geriatric: string | null;
          half_life: string | null;
          hepatic: string | null;
          id: string;
          indications: string[] | null;
          key_points: string[] | null;
          key_suffix: string | null;
          lactation: string | null;
          last_verified: string | null;
          mechanism_of_action: string | null;
          memory_trick: string | null;
          metabolism: string | null;
          monitoring: string[] | null;
          onset: string | null;
          patient_counselling: string[] | null;
          pediatric: string | null;
          pharmacodynamics: string | null;
          precautions: string[] | null;
          pregnancy: string | null;
          pronunciation_en: string | null;
          pronunciation_hi: string | null;
          pronunciation_ipa: string | null;
          protein_binding: string | null;
          renal: string | null;
          routes: string[] | null;
          salt: string | null;
          serious_adverse_effects: string[] | null;
          slug: string;
          status: string;
          storage: string | null;
          strengths: string[] | null;
          synonyms: string[] | null;
          updated_at: string;
          verification_status: string;
          volume_of_distribution: string | null;
          warnings: string[] | null;
        };
        Insert: {
          absorption?: string | null;
          active_ingredient?: string | null;
          advantages?: string[] | null;
          bioavailability?: string | null;
          category?: string | null;
          clearance?: string | null;
          common_adverse_effects?: string[] | null;
          contraindications?: string[] | null;
          created_at?: string;
          data_version?: string;
          description?: string | null;
          disadvantages?: string[] | null;
          display_name: string;
          distribution?: string | null;
          dosage_forms?: string[] | null;
          drug_interactions?: string[] | null;
          duration?: string | null;
          excretion?: string | null;
          food_interactions?: string[] | null;
          generic_name: string;
          geriatric?: string | null;
          half_life?: string | null;
          hepatic?: string | null;
          id?: string;
          indications?: string[] | null;
          key_points?: string[] | null;
          key_suffix?: string | null;
          lactation?: string | null;
          last_verified?: string | null;
          mechanism_of_action?: string | null;
          memory_trick?: string | null;
          metabolism?: string | null;
          monitoring?: string[] | null;
          onset?: string | null;
          patient_counselling?: string[] | null;
          pediatric?: string | null;
          pharmacodynamics?: string | null;
          precautions?: string[] | null;
          pregnancy?: string | null;
          pronunciation_en?: string | null;
          pronunciation_hi?: string | null;
          pronunciation_ipa?: string | null;
          protein_binding?: string | null;
          renal?: string | null;
          routes?: string[] | null;
          salt?: string | null;
          serious_adverse_effects?: string[] | null;
          slug: string;
          status?: string;
          storage?: string | null;
          strengths?: string[] | null;
          synonyms?: string[] | null;
          updated_at?: string;
          verification_status?: string;
          volume_of_distribution?: string | null;
          warnings?: string[] | null;
        };
        Update: {
          absorption?: string | null;
          active_ingredient?: string | null;
          advantages?: string[] | null;
          bioavailability?: string | null;
          category?: string | null;
          clearance?: string | null;
          common_adverse_effects?: string[] | null;
          contraindications?: string[] | null;
          created_at?: string;
          data_version?: string;
          description?: string | null;
          disadvantages?: string[] | null;
          display_name?: string;
          distribution?: string | null;
          dosage_forms?: string[] | null;
          drug_interactions?: string[] | null;
          duration?: string | null;
          excretion?: string | null;
          food_interactions?: string[] | null;
          generic_name?: string;
          geriatric?: string | null;
          half_life?: string | null;
          hepatic?: string | null;
          id?: string;
          indications?: string[] | null;
          key_points?: string[] | null;
          key_suffix?: string | null;
          lactation?: string | null;
          last_verified?: string | null;
          mechanism_of_action?: string | null;
          memory_trick?: string | null;
          metabolism?: string | null;
          monitoring?: string[] | null;
          onset?: string | null;
          patient_counselling?: string[] | null;
          pediatric?: string | null;
          pharmacodynamics?: string | null;
          precautions?: string[] | null;
          pregnancy?: string | null;
          pronunciation_en?: string | null;
          pronunciation_hi?: string | null;
          pronunciation_ipa?: string | null;
          protein_binding?: string | null;
          renal?: string | null;
          routes?: string[] | null;
          salt?: string | null;
          serious_adverse_effects?: string[] | null;
          slug?: string;
          status?: string;
          storage?: string | null;
          strengths?: string[] | null;
          synonyms?: string[] | null;
          updated_at?: string;
          verification_status?: string;
          volume_of_distribution?: string | null;
          warnings?: string[] | null;
        };
        Relationships: [];
      };
      mnemonics: {
        Row: {
          class_id: string | null;
          content: string;
          created_at: string;
          explanation: string | null;
          id: string;
          medicine_id: string | null;
          title: string;
        };
        Insert: {
          class_id?: string | null;
          content: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          medicine_id?: string | null;
          title: string;
        };
        Update: {
          class_id?: string | null;
          content?: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          medicine_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mnemonics_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "drug_classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mnemonics_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          language_preference: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          language_preference?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          language_preference?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          correct_answer: string;
          created_at: string;
          difficulty: string;
          explanation: string | null;
          id: string;
          medicine_id: string | null;
          options: string[];
          question: string;
          question_type: string;
          topic: string;
        };
        Insert: {
          correct_answer: string;
          created_at?: string;
          difficulty?: string;
          explanation?: string | null;
          id?: string;
          medicine_id?: string | null;
          options?: string[];
          question: string;
          question_type?: string;
          topic?: string;
        };
        Update: {
          correct_answer?: string;
          created_at?: string;
          difficulty?: string;
          explanation?: string | null;
          id?: string;
          medicine_id?: string | null;
          options?: string[];
          question?: string;
          question_type?: string;
          topic?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
        ];
      };
      recently_viewed: {
        Row: {
          id: string;
          item_id: string;
          item_type: string;
          label: string | null;
          user_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          item_type: string;
          label?: string | null;
          user_id: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          item_type?: string;
          label?: string | null;
          user_id?: string;
          viewed_at?: string;
        };
        Relationships: [];
      };
      references: {
        Row: {
          accessed_date: string | null;
          id: string;
          notes: string | null;
          published_date: string | null;
          source_name: string;
          source_type: string | null;
          source_url: string | null;
        };
        Insert: {
          accessed_date?: string | null;
          id?: string;
          notes?: string | null;
          published_date?: string | null;
          source_name: string;
          source_type?: string | null;
          source_url?: string | null;
        };
        Update: {
          accessed_date?: string | null;
          id?: string;
          notes?: string | null;
          published_date?: string | null;
          source_name?: string;
          source_type?: string | null;
          source_url?: string | null;
        };
        Relationships: [];
      };
      review_schedule: {
        Row: {
          correct_count: number;
          difficulty: string;
          first_studied: string;
          flashcard_id: string;
          id: string;
          incorrect_count: number;
          interval_days: number;
          last_reviewed: string | null;
          next_review: string;
          review_count: number;
          user_id: string;
        };
        Insert: {
          correct_count?: number;
          difficulty?: string;
          first_studied?: string;
          flashcard_id: string;
          id?: string;
          incorrect_count?: number;
          interval_days?: number;
          last_reviewed?: string | null;
          next_review?: string;
          review_count?: number;
          user_id: string;
        };
        Update: {
          correct_count?: number;
          difficulty?: string;
          first_studied?: string;
          flashcard_id?: string;
          id?: string;
          incorrect_count?: number;
          interval_days?: number;
          last_reviewed?: string | null;
          next_review?: string;
          review_count?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_schedule_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
        ];
      };
      safety_alerts: {
        Row: {
          alert_date: string | null;
          class_id: string | null;
          created_at: string;
          description: string;
          id: string;
          last_verified: string | null;
          medicine_id: string | null;
          severity: string;
          source_name: string | null;
          source_url: string | null;
          status: string;
          title: string;
          updated_at: string;
          verification_status: string;
        };
        Insert: {
          alert_date?: string | null;
          class_id?: string | null;
          created_at?: string;
          description: string;
          id?: string;
          last_verified?: string | null;
          medicine_id?: string | null;
          severity?: string;
          source_name?: string | null;
          source_url?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          verification_status?: string;
        };
        Update: {
          alert_date?: string | null;
          class_id?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          last_verified?: string | null;
          medicine_id?: string | null;
          severity?: string;
          source_name?: string | null;
          source_url?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          verification_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "safety_alerts_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "drug_classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "safety_alerts_medicine_id_fkey";
            columns: ["medicine_id"];
            isOneToOne: false;
            referencedRelation: "medicines";
            referencedColumns: ["id"];
          },
        ];
      };
      suffix_patterns: {
        Row: {
          class_hint: string | null;
          examples: string[] | null;
          id: string;
          meaning: string;
          note: string | null;
          suffix: string;
        };
        Insert: {
          class_hint?: string | null;
          examples?: string[] | null;
          id?: string;
          meaning: string;
          note?: string | null;
          suffix: string;
        };
        Update: {
          class_hint?: string | null;
          examples?: string[] | null;
          id?: string;
          meaning?: string;
          note?: string | null;
          suffix?: string;
        };
        Relationships: [];
      };
      user_favorites: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          item_type: string;
          label: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          item_type: string;
          label?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          item_type?: string;
          label?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      consume_ai_rate_limit: {
        Args: {
          _key: string;
          _limit: number;
          _min_interval_ms: number;
          _window_seconds: number;
        };
        Returns: Json;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      normalize_name: { Args: { _v: string }; Returns: string };
    };
    Enums: {
      app_role: "admin" | "editor" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const;
