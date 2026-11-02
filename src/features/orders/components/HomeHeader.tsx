
import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function HomeHeader() {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={19} color="#999999" />

          <TextInput
            style={styles.input}
            placeholder="Search for food..."
            placeholderTextColor="#999999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <Pressable style={styles.iconButton}>
          <Feather name="shopping-bag" size={23} color="#F4511E" />
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Feather name="bell" size={23} color="#F4511E" />
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Feather name="user" size={23} color="#F4511E" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F8CF58',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 9,
  },
  input: {
    flex: 1,
    color: '#40231F',
    fontSize: 14,
    paddingVertical: 0,
  },
  iconButton: {
    width: 30,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
