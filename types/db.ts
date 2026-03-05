/**
 * SUPABASE DATABASE SCHEMA MAP
 * ----------------------------
 * This file defines the shape of our data in the future Supabase PostgreSQL database.
 * Use this as a reference when creating tables in the Supabase Dashboard.
 * 
 * STRATEGY: Public Shared Schema
 * All apps (Mother & Satellites) will connect to the same Supabase Project
 * to share User and Project data effortlessly.
 */

// 1. Table: profiles
// Extends the default Supabase auth.users
export interface DbProfile {
    id: string; // References auth.users(id)
    email: string;
    full_name: string;
    avatar_url?: string;
    language: 'en' | 'es';
    subscription_plan: 'free' | 'pro' | 'enterprise'; // Monetization hook
    created_at: string;
}

// 2. Table: projects
// The core entity. Apps read from here to style themselves.
export interface DbProject {
    id: string; // UUID
    owner_id: string; // References profiles(id)
    name: string;
    
    // Branding & Identity
    brand_colors: string[]; // JSONB array: ['#333', '#fff', '#000']
    logo_url?: string;
    industry?: string;
    
    // Contact Info (JSONB for flexibility)
    contact_info: {
        email?: string;
        phone?: string;
        whatsapp?: string;
        address?: string;
        website?: string;
        socials?: Array<{ platform: string, username: string }>;
    };

    // Installed Apps (Marketplace Logic)
    // Simple array of strings. Satellite apps check this before loading.
    installed_apps: string[]; // e.g., ['invoicer', 'web-builder']

    created_at: string;
}

// 3. Table: project_members
// Handles team access.
export interface DbProjectMember {
    id: string;
    project_id: string; // References projects(id)
    user_id: string;    // References profiles(id)
    role: 'owner' | 'editor' | 'viewer';
    joined_at: string;
}

// 4. Satellite App Specific Tables (Examples)
// These tables belong to specific apps but link back to project_id

export interface DbInvoice {
    id: string;
    project_id: string; // THE KEY LINK
    client_name: string;
    total_amount: number;
    status: 'draft' | 'sent' | 'paid';
}

export interface DbWebsite {
    id: string;
    project_id: string; // THE KEY LINK
    domain?: string;
    published: boolean;
    content: any; // JSONB page structure
}
