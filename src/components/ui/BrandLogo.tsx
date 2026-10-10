import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme'; // Imported theme to access colors

interface BrandLogoProps {
  variant?: 'welcome' | 'compact';
  isSplash?: boolean; // 1. Added isSplash as an optional boolean prop
}

export default function BrandLogo({ 
  variant = 'welcome', 
  isSplash = false // 2. Defaulted to false if not explicitly passed
}: BrandLogoProps) {
  return (
    <View style={styles.container}>
      <Image 
        source={
          isSplash
            ? require('../../../assets/images/splashscreen.png')
            : require('../../../assets/images/cadastro.png')
        }
        style={styles.logoImage} 
        resizeMode="contain" 
      />

      {variant === 'welcome' && (
        <Text style={styles.brandName}>
          {/* 3. Implemented your conditional style for YUM */}
          <Text
            style={{
              color: isSplash
                ? theme.colors.primary
                : theme.colors.background,
            }}
          >
            YUM
          </Text>
          
          {/* 4. Implemented inline white styling for QUICK */}
          <Text style={{ color: '#FFFFFF' }}>
            QUICK
          </Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,  
    height: 140, 
  },
  brandName: {
    fontSize: 25,
    fontWeight: '900',
    marginTop: 12,
  },
  
});
