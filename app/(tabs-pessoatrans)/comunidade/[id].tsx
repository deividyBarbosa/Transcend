// isso tbm nao é nada

import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PostDetalhe() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ padding: 16 }}>
      <Text>Post {id}</Text>
      <Text>Comentários aqui</Text>
    </View>
  );
}
