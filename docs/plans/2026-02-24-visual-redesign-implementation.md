# Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Sync app to feel sleek and Partiful-inspired — electric violet gradients, frosted glass cards, Space Grotesk headings throughout, with restraint.

**Architecture:** Replace the flat lavender/dark-navy palette with a near-black background + `#8875ff → #c084fc` violet gradient accent. Use `expo-linear-gradient` for gradient buttons and decorative elements. Glass cards via semi-transparent backgrounds + border. No `expo-blur` (too heavy for RN web).

**Tech Stack:** React Native, NativeWind v4, expo-linear-gradient, Space Grotesk (already loaded), Tailwind custom tokens.

---

### Task 1: Install expo-linear-gradient + update design tokens

**Files:**
- Modify: `tailwind.config.js`
- Modify: `package.json` (via install)

**Step 1: Install**
```bash
cd ~/Code/sync && npx expo install expo-linear-gradient
```

**Step 2: Replace tailwind.config.js colors**

Replace the entire `colors` block in `tailwind.config.js` with:
```js
colors: {
  violet: {
    DEFAULT: '#8875ff',
    50:  '#f3f1ff',
    100: '#e5e0ff',
    200: '#cdc5ff',
    300: '#b0a4ff',
    400: '#9b8fff',
    500: '#8875ff',
    600: '#7560f0',
    700: '#6250d8',
  },
  'accent-2': '#c084fc',
  dark: {
    50:  '#f0f0ff',
    100: '#d0d0e8',
    200: '#a0a0c0',
    300: '#8b8fa8',
    400: '#5a5f7a',
    500: '#3a3f58',
    600: '#252840',
    700: '#181b2e',
    800: '#111320',
    900: '#09090f',
    950: '#05050a',
  },
  card: 'rgba(255,255,255,0.05)',
},
```

**Step 3: Commit**
```bash
git add tailwind.config.js package.json package-lock.json
git commit -m "feat: install expo-linear-gradient, update design tokens to violet palette"
```

---

### Task 2: Update Button component (gradient primary)

**Files:**
- Modify: `components/ui/Button.tsx`

**Step 1: Rewrite Button.tsx**

```tsx
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
};

export function Button({ title, onPress, loading = false, disabled = false, variant = 'primary' }: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.8} style={{ width: '100%', borderRadius: 16, overflow: 'hidden', opacity: isDisabled ? 0.5 : 1 }}>
        <LinearGradient
          colors={['#8875ff', '#c084fc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 }}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const baseClasses = 'w-full rounded-2xl py-4 items-center justify-center';
  const variantClasses = {
    secondary: 'bg-dark-700 border border-white/10',
    outline:   'border border-white/15',
  } as Record<string, string>;
  const textColor = '#d0d0e8';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
```

**Step 2: Commit**
```bash
git add components/ui/Button.tsx
git commit -m "feat: gradient primary button with expo-linear-gradient"
```

---

### Task 3: Update Input component (glass style)

**Files:**
- Modify: `components/ui/Input.tsx`

**Step 1: Rewrite Input.tsx**

```tsx
import { TextInput, View, Text } from 'react-native';
import { useState } from 'react';

type InputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  error?: string;
  testID?: string;
};

export function Input({ label, value, onChangeText, placeholder, secureTextEntry = false, autoCapitalize = 'none', keyboardType = 'default', error, testID }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ width: '100%', marginBottom: 16 }}>
      <Text style={{ color: '#8b8fa8', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 2, letterSpacing: 0.3 }}>{label}</Text>
      <TextInput
        style={{
          width: '100%',
          backgroundColor: focused ? 'rgba(136,117,255,0.08)' : 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: '#f0f0ff',
          fontSize: 15,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : focused ? '#8875ff' : 'rgba(255,255,255,0.1)',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#5a5f7a"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        testID={testID}
      />
      {error && <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 2 }}>{error}</Text>}
    </View>
  );
}
```

**Step 2: Commit**
```bash
git add components/ui/Input.tsx
git commit -m "feat: glass-style input with violet focus border"
```

---

### Task 4: Update Avatar component (gradient ring option)

**Files:**
- Modify: `components/Avatar.tsx`

**Step 1: Rewrite Avatar.tsx**

```tsx
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AvatarProps = {
  url?: string | null;
  name: string;
  size?: number;
  ring?: boolean;
};

export function Avatar({ url, name, size = 48, ring = false }: AvatarProps) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const inner = url ? (
    <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <LinearGradient
      colors={['#8875ff', '#c084fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: '#ffffff' }}>{initials}</Text>
    </LinearGradient>
  );

  if (ring) {
    const ringPad = 2;
    return (
      <LinearGradient
        colors={['#8875ff', '#c084fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size + ringPad * 2 + 4, height: size + ringPad * 2 + 4, borderRadius: (size + ringPad * 2 + 4) / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, backgroundColor: '#09090f', alignItems: 'center', justifyContent: 'center' }}>
          {inner}
        </View>
      </LinearGradient>
    );
  }

  return inner;
}
```

**Step 2: Commit**
```bash
git add components/Avatar.tsx
git commit -m "feat: avatar with gradient fill and optional gradient ring"
```

---

### Task 5: Update InterestChip component

**Files:**
- Modify: `components/ui/InterestChip.tsx`

**Step 1: Read current file, then update**

Replace with glass/gradient chip:
```tsx
import { TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type InterestChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function InterestChip({ label, selected = false, onPress }: InterestChipProps) {
  if (selected && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginRight: 8, marginBottom: 8, borderRadius: 999, overflow: 'hidden' }}>
        <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 14, paddingVertical: 7 }}>
          <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (selected) {
    return (
      <LinearGradient colors={['#8875ff', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginRight: 8, marginBottom: 8, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
        <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>{label}</Text>
      </LinearGradient>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ marginRight: 8, marginBottom: 8, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <Text style={{ color: '#8b8fa8', fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}
```

**Step 2: Commit**
```bash
git add components/ui/InterestChip.tsx
git commit -m "feat: glass/gradient interest chips"
```

---

### Task 6: Update Tab Bar

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Update tab bar style options**

Replace the `screenOptions` object:
```tsx
screenOptions={{
  headerShown: false,
  tabBarActiveTintColor: '#8875ff',
  tabBarInactiveTintColor: '#5a5f7a',
  tabBarStyle: {
    backgroundColor: '#0e0e1a',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600',
  },
}}
```

Also update badge style:
```tsx
tabBarBadgeStyle: { backgroundColor: '#8875ff', color: '#ffffff', fontSize: 10 },
```

**Step 2: Commit**
```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: update tab bar to dark violet theme"
```

---

### Task 7: Login screen redesign

**Files:**
- Modify: `app/(auth)/login.tsx`

**Step 1: Update login.tsx**

```tsx
import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#09090f' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Background glow */}
      <View style={{ position: 'absolute', top: -100, left: '50%', marginLeft: -150, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(136,117,255,0.12)' }} pointerEvents="none" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 56 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 64, letterSpacing: -3, color: '#8875ff' }}>sync</Text>
          <Text style={{ color: '#8b8fa8', marginTop: 8, fontSize: 15 }}>coordinate hangouts with friends</Text>
        </View>
        {/* Form */}
        <View style={{ gap: 4 }}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" testID="email-input" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry testID="password-input" />
          {error ? (
            <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 }}>
              <Text style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}
          <View style={{ marginTop: 8 }}>
            <Button title="Sign In" onPress={handleLogin} loading={loading} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#5a5f7a' }}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={{ color: '#8875ff', fontWeight: '600' }}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

**Step 2: Commit**
```bash
git add app/(auth)/login.tsx
git commit -m "feat: redesign login screen with violet glow + glass inputs"
```

---

### Task 8: Signup screen redesign

**Files:**
- Modify: `app/(auth)/signup.tsx`

**Step 1:** Apply same background (`#09090f`), same glow orb behind logo, same logo treatment (64px SpaceGrotesk violet), glass inputs. Keep multi-step logic identical — only change colors/styles. For the interests step, the InterestChip component already handles the new style.

Key style changes:
- Outer container: `backgroundColor: '#09090f'`
- Logo: same as login (64px, `#8875ff`, SpaceGrotesk_700Bold)
- All inline `className` color references: replace `bg-gray-50 dark:bg-dark-900` → `backgroundColor: '#09090f'`
- Section title ("Create your account", "Pick your interests"): `fontFamily: 'SpaceGrotesk_700Bold'`, `color: '#f0f0ff'`, 28px
- Subtitle: `color: '#8b8fa8'`

**Step 2: Commit**
```bash
git add app/(auth)/signup.tsx
git commit -m "feat: redesign signup screen to match login dark theme"
```

---

### Task 9: Home screen redesign

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Key changes:**

1. **SafeAreaView/ScrollView background:** `backgroundColor: '#09090f'`
2. **"sync" logo:** `color: '#8875ff'`, same font
3. **"Availability" pill button:** glass style:
   ```tsx
   style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(136,117,255,0.4)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}
   ```
   Icon color: `#8875ff`

4. **Section labels** ("WHO'S DOWN?", "MAKE A PLAN", "YOUR AVAILABILITY"):
   ```tsx
   style={{ color: '#5a5f7a', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}
   ```

5. **Proposal cards:** glass body:
   ```tsx
   // Card body: replace bg-white dark:bg-dark-700
   style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 12 }}
   // "Respond" badge: gradient pill
   <LinearGradient colors={['#8875ff','#c084fc']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
     <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Respond</Text>
   </LinearGradient>
   ```

6. **Overlap alert cards:** glass + violet left border:
   ```tsx
   style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderLeftWidth: 3, borderLeftColor: '#8875ff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}
   ```
   "Plan →" badge: gradient pill

7. **WeekNavigator:** already updated via token changes (chevron becomes violet)

8. **HeatmapGrid:** update in Task 10

**Step: Commit**
```bash
git add app/(tabs)/index.tsx
git commit -m "feat: home screen glass cards + violet accents"
```

---

### Task 10: Update HeatmapGrid colors

**Files:**
- Modify: `components/HeatmapGrid.tsx`

**Key change:** Replace `lavender` cell colors with `#8875ff` (available) and `#c084fc` opacity (friends). Today indicator circle: gradient background via inline style or solid `#8875ff`.

Read the file first, then replace all `lavender` / `#a4a8d1` / `#bba0b2` color references with violet palette values.

**Commit:**
```bash
git add components/HeatmapGrid.tsx
git commit -m "feat: heatmap cells updated to violet palette"
```

---

### Task 11: Profile screen redesign

**Files:**
- Modify: `app/(tabs)/profile.tsx`

**Key changes:**
1. Background: `#09090f`
2. Avatar: add `ring` prop → `<Avatar url={...} name={...} size={88} ring />`
3. Display name: `fontFamily: 'SpaceGrotesk_700Bold'`, `color: '#f0f0ff'`, 24px
4. Username: `color: '#8b8fa8'`
5. Stats card: glass (`rgba(255,255,255,0.05)` bg, `rgba(255,255,255,0.08)` border)
6. "Hangout Stats" badge: gradient pill
7. Activity stat items: `rgba(255,255,255,0.06)` bg
8. Edit Profile button: glass style
9. Settings card (Friends/Groups/Dark Mode): glass background, `rgba(255,255,255,0.08)` dividers
10. Dark Mode switch track: `true: '#8875ff'`
11. Icon colors: `#8875ff` for accent icons

**Commit:**
```bash
git add app/(tabs)/profile.tsx
git commit -m "feat: profile screen dark redesign with gradient avatar ring"
```

---

### Task 12: Friends + Groups screens

**Files:**
- Modify: `components/FriendCard.tsx`
- Modify: `components/GroupCard.tsx`
- Modify: `app/(tabs)/friends.tsx`
- Modify: `app/(tabs)/groups.tsx`

**FriendCard key changes:**
- Card background: `rgba(255,255,255,0.05)`, border: `rgba(255,255,255,0.08)`
- Accept button: gradient primary (small — wrap in a small `LinearGradient` with `borderRadius: 12`)
- Decline button: glass with `color: '#8b8fa8'`

**GroupCard key changes:**
- Card background: glass
- Group icon container: gradient background
- Role badge: `rgba(136,117,255,0.2)` bg, `#8875ff` text

**Screen backgrounds:** `#09090f` for both

**Commit:**
```bash
git add components/FriendCard.tsx components/GroupCard.tsx app/(tabs)/friends.tsx app/(tabs)/groups.tsx
git commit -m "feat: friends + groups glass card redesign"
```

---

### Task 13: Proposals + Feed screens

**Files:**
- Modify: `app/(tabs)/propose.tsx`
- Modify: `app/(tabs)/feed.tsx`

**Proposals key changes:**
- Background: `#09090f`
- Section headers: Space Grotesk 600, uppercase, `#5a5f7a`
- Proposal cards: glass body + gradient activity header band
- "Respond" badge: gradient pill
- Response status (Going/Declined/Maybe): keep semantic colors, just update bg opacity

**Feed key changes:**
- Background: `#09090f`
- Filter chips: use InterestChip (already updated)
- Hangout cards: glass background
- Reaction buttons: glass pill, `#8875ff` active

**Commit:**
```bash
git add app/(tabs)/propose.tsx app/(tabs)/feed.tsx
git commit -m "feat: proposals + feed glass redesign"
```

---

### Task 14: Smoke test in browser

**Step 1:** Run `npm run web` and open `http://localhost:8081`

**Step 2:** Check each screen:
- [ ] Login: glow orb visible, gradient logo, glass inputs, gradient button
- [ ] Signup: consistent with login, gradient chips on select
- [ ] Home: dark bg, glass proposal cards, violet heatmap cells
- [ ] Profile: gradient avatar ring, glass cards
- [ ] Tab bar: violet active icons

**Step 3:** Fix any visual regressions before committing.

---

### Task 15: Final commit + push

```bash
git push origin main
```
