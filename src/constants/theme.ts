// Aqui nos definimos as cores que serao utilizadas no projeto. feito isso, podemos importar o arquivo theme.ts em qualquer lugar,
// que ele vai saber doque estamos falando. 

export const theme = {
  colors: {
    primary: '#F04B1D',
    background: '#F7CF58',
    text: '#FFFFFF',
    dark: '#202020',
    buttonText: '#F04B1D',
    textSecondary: '#666666', // Adicionado para corrigir o erro da linha 31
    surface: '#FFFFFF',       // Adicionado para corrigir o erro da linha 40
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    round: 999,
  },
};
