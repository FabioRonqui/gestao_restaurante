//Aqui criamos as telas provisorias para o projeto.
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>User</Text>
          <TextInput
            accessibilityLabel="User"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={user}
            onChangeText={setUser}
            placeholder="User"
            placeholderTextColor="#777777"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#777777"
            secureTextEntry
          />
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => Alert.alert('Login indisponível', 'O login ainda não foi implementado.')}
        >
          <Text style={styles.buttonText}>Confirmar login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderColor: '#777777',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
