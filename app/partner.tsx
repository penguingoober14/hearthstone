import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useUserStore, useProgressStore } from '../src/stores';
import { useToast } from '../src/components/Toast';
import { colors, spacing, borderRadius, shadows } from '../src/lib/theme';
import { Button } from '../src/components';
import {
  createPartnerInvite,
  acceptPartnerInvite,
  unlinkPartner,
  getActiveInviteCode,
} from '../src/lib/partnerLink';

export default function PartnerScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { partner, setPartner } = useUserStore();
  const { recordPartnerConnected } = useProgressStore();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Load existing invite code on mount
  useEffect(() => {
    const loadInviteCode = async () => {
      const { code } = await getActiveInviteCode();
      if (code) {
        setInviteCode(code);
      }
    };
    loadInviteCode();
  }, []);

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const { code, error } = await createPartnerInvite();
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      setInviteCode(code);
      showToast('Invite code created!');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
      showToast('Code copied to clipboard!');
    }
  };

  const handleShareCode = async () => {
    if (inviteCode) {
      try {
        await Share.share({
          message: `Join me on Hearthstone! Use my partner code: ${inviteCode}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleAcceptInvite = async () => {
    if (inputCode.length !== 6) {
      showToast('Please enter a 6-character code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { partnerId, partnerName, error } = await acceptPartnerInvite(inputCode);
      if (error) {
        showToast(error.message, 'error');
        return;
      }

      // Update local state
      if (partnerId && partnerName) {
        setPartner({
          id: partnerId,
          name: partnerName,
          email: '',
          avatarUrl: null,
          preferences: {
            dietaryRestrictions: [],
            dislikedIngredients: [],
            favoriteCuisines: [],
            cookingSkillLevel: 'intermediate',
            weeknightMaxTime: 45,
            weekendMaxTime: 90,
            chefMode: false,
          },
          partnerId: null,
        });

        // Record achievement
        recordPartnerConnected();

        showToast(`You're now cooking partners with ${partnerName}!`, 'success');
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkPartner = () => {
    Alert.alert(
      'Unlink Partner?',
      `Are you sure you want to unlink from ${partner?.name}? You can always reconnect later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { error } = await unlinkPartner();
              if (error) {
                showToast(error.message, 'error');
                return;
              }
              setPartner(null);
              showToast('Partner unlinked successfully');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {partner ? (
          // Connected partner view
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>💑</Text>
            <Text style={styles.cardTitle}>Cooking with {partner.name}</Text>
            <Text style={styles.cardSubtitle}>
              You're linked as cooking partners! Your meal plans and achievements are shared.
            </Text>

            <View style={styles.partnerInfo}>
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerInitial}>
                  {partner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.partnerName}>{partner.name}</Text>
            </View>

            <Button
              title="Unlink Partner"
              onPress={handleUnlinkPartner}
              variant="outline"
              loading={isLoading}
              style={styles.unlinkButton}
            />
          </View>
        ) : (
          <>
            {/* Invite section */}
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>📨</Text>
              <Text style={styles.cardTitle}>Invite Your Partner</Text>
              <Text style={styles.cardSubtitle}>
                Share this code with your partner so they can connect with you.
              </Text>

              {inviteCode ? (
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{inviteCode}</Text>
                  <View style={styles.codeActions}>
                    <TouchableOpacity style={styles.codeButton} onPress={handleCopyCode}>
                      <Text style={styles.codeButtonText}>📋 Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.codeButton} onPress={handleShareCode}>
                      <Text style={styles.codeButtonText}>📤 Share</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.expiryNote}>Code expires in 7 days</Text>
                </View>
              ) : (
                <Button
                  title="Generate Invite Code"
                  onPress={handleGenerateCode}
                  variant="primary"
                  loading={isGeneratingCode}
                />
              )}
            </View>

            {/* Accept invite section */}
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>🔗</Text>
              <Text style={styles.cardTitle}>Join Your Partner</Text>
              <Text style={styles.cardSubtitle}>
                Enter the code your partner shared with you.
              </Text>

              <TextInput
                style={styles.codeInput}
                placeholder="Enter 6-character code"
                placeholderTextColor={colors.gray400}
                value={inputCode}
                onChangeText={(text) => setInputCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <Button
                title="Connect"
                onPress={handleAcceptInvite}
                variant="primary"
                disabled={inputCode.length !== 6}
                loading={isLoading}
              />
            </View>
          </>
        )}

        {/* Benefits info */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Partner Benefits</Text>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>🍽️</Text>
            <Text style={styles.benefitText}>Coordinate meal planning together</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>🏆</Text>
            <Text style={styles.benefitText}>Earn couple cooking achievements</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>📊</Text>
            <Text style={styles.benefitText}>Track meals cooked together</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitEmoji}>👨‍🍳</Text>
            <Text style={styles.benefitText}>Take turns claiming cooking duties</Text>
          </View>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.hearthOrange} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  headerSpacer: {
    width: 70,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  codeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.hearthOrange,
    letterSpacing: 8,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
  codeActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  codeButton: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  codeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
  },
  expiryNote: {
    fontSize: 12,
    color: colors.gray400,
  },
  codeInput: {
    width: '100%',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.charcoal,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: colors.sageGreenLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
  },
  unlinkButton: {
    width: '100%',
  },
  benefitsCard: {
    backgroundColor: colors.hearthOrangeLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.hearthOrange,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  benefitEmoji: {
    fontSize: 18,
  },
  benefitText: {
    fontSize: 14,
    color: colors.gray600,
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
