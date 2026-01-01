/**
 * Partner Linking Service
 * Handles invitation codes and partner connections
 */

import { supabase } from './supabase';

// Generate a random 6-character invite code
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Store an invite code for the current user
export async function createPartnerInvite(): Promise<{ code: string | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { code: null, error: new Error('Not authenticated') };
    }

    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Upsert invite code (replace any existing)
    // Use type assertion for Supabase compatibility
    const { error } = await (supabase as any)
      .from('partner_invites')
      .upsert({
        user_id: user.id,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (error) {
      console.error('[partnerLink] Error creating invite:', error.message);
      return { code: null, error: new Error(error.message) };
    }

    return { code, error: null };
  } catch (err) {
    console.error('[partnerLink] Unexpected error:', err);
    return { code: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

// Accept a partner invite
export async function acceptPartnerInvite(code: string): Promise<{ partnerId: string | null; partnerName: string | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { partnerId: null, partnerName: null, error: new Error('Not authenticated') };
    }

    // Find the invite (use type assertion for Supabase compatibility)
    const { data: inviteData, error: findError } = await (supabase as any)
      .from('partner_invites')
      .select('user_id, expires_at, used')
      .eq('code', code.toUpperCase())
      .single();

    const invite = inviteData as { user_id: string; expires_at: string; used: boolean } | null;

    if (findError || !invite) {
      return { partnerId: null, partnerName: null, error: new Error('Invalid invite code') };
    }

    if (invite.used) {
      return { partnerId: null, partnerName: null, error: new Error('This invite has already been used') };
    }

    if (new Date(invite.expires_at) < new Date()) {
      return { partnerId: null, partnerName: null, error: new Error('This invite has expired') };
    }

    if (invite.user_id === user.id) {
      return { partnerId: null, partnerName: null, error: new Error('You cannot partner with yourself') };
    }

    // Get partner's name
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', invite.user_id)
      .single();

    // Link the two users as partners (update both profiles)
    const { error: linkError1 } = await supabase
      .from('profiles')
      .update({ partner_id: invite.user_id })
      .eq('id', user.id);

    if (linkError1) {
      return { partnerId: null, partnerName: null, error: new Error(linkError1.message) };
    }

    const { error: linkError2 } = await supabase
      .from('profiles')
      .update({ partner_id: user.id })
      .eq('id', invite.user_id);

    if (linkError2) {
      // Rollback the first link
      await supabase
        .from('profiles')
        .update({ partner_id: null })
        .eq('id', user.id);
      return { partnerId: null, partnerName: null, error: new Error(linkError2.message) };
    }

    // Mark invite as used
    await supabase
      .from('partner_invites')
      .update({ used: true })
      .eq('code', code.toUpperCase());

    return {
      partnerId: invite.user_id,
      partnerName: partnerProfile?.name || 'Partner',
      error: null,
    };
  } catch (err) {
    console.error('[partnerLink] Unexpected error:', err);
    return { partnerId: null, partnerName: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

// Unlink from partner
export async function unlinkPartner(): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    // Get current partner ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .single();

    if (!profile?.partner_id) {
      return { error: new Error('No partner linked') };
    }

    // Remove partner link from both users
    const { error: unlinkError1 } = await supabase
      .from('profiles')
      .update({ partner_id: null })
      .eq('id', user.id);

    if (unlinkError1) {
      return { error: new Error(unlinkError1.message) };
    }

    const { error: unlinkError2 } = await supabase
      .from('profiles')
      .update({ partner_id: null })
      .eq('id', profile.partner_id);

    if (unlinkError2) {
      console.error('[partnerLink] Error unlinking partner side:', unlinkError2.message);
      // Don't return error, the main unlink succeeded
    }

    return { error: null };
  } catch (err) {
    console.error('[partnerLink] Unexpected error:', err);
    return { error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

// Get current user's active invite code
export async function getActiveInviteCode(): Promise<{ code: string | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { code: null, error: new Error('Not authenticated') };
    }

    const { data: invite, error } = await supabase
      .from('partner_invites')
      .select('code, expires_at, used')
      .eq('user_id', user.id)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !invite) {
      return { code: null, error: null }; // No active invite
    }

    return { code: invite.code, error: null };
  } catch (err) {
    console.error('[partnerLink] Unexpected error:', err);
    return { code: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}
