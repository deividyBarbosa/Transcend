// só deus sabe se isso funciona

import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../../src/theme/colors';
import { mockComunidade, Post } from '../../../src/mocks/mockComunidade';
import { Ionicons } from '@expo/vector-icons';

export default function Comunidade() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(
    [...mockComunidade].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  function toggleLike(id: string) {
    setPosts(prev =>
      prev.map(post =>
        post.id === id
          ? {
              ...post,
              likedByUser: !post.likedByUser,
              likes: post.likedByUser
                ? post.likes - 1
                : post.likes + 1,
            }
          : post
      )
    );
  }

  function renderPost({ item }: { item: Post }) {
    return (
      <Pressable
        onPress={() => router.push(`/comunidade/${item.id}`)}
        style={{
          backgroundColor: colors.white,
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Inter-SemiBold',
            color: colors.text,
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>

        <Text
          numberOfLines={3}
          style={{
            fontSize: 14,
            fontFamily: 'Inter-Regular',
            color: colors.muted,
            marginBottom: 12,
          }}
        >
          {item.content}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() => toggleLike(item.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            
            <Ionicons
            name={item.likedByUser ? 'heart' : 'heart-outline'}
            size={20}
            color={item.likedByUser ? colors.primary : colors.muted}
            />

            <Text style={{ color: colors.muted }}>
              {item.likes}
            </Text>
          </Pressable>

          <Text style={{ color: colors.muted }}>
            💬 {item.comments.length}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão flutuante */}
      <Pressable
        onPress={() => router.push('/comunidade/novo-post')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          backgroundColor: colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
        }}
      >
        <Text style={{ color: colors.white, fontSize: 28 }}>＋</Text>
      </Pressable>
    </View>
  );
}
