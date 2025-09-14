import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { GiftedChat } from 'react-native-gifted-chat';

const ChatScreen = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        const formattedMessages = data.map(msg => ({
          _id: msg.id,
          text: msg.content_plaintext,
          createdAt: new Date(msg.created_at),
          user: {
            _id: msg.sender_id,
          },
        }));
        setMessages(formattedMessages);
      }
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`public:messages:conversation_id=eq.${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        const formattedMessage = {
            _id: newMessage.id,
            text: newMessage.content_plaintext,
            createdAt: new Date(newMessage.created_at),
            user: {
              _id: newMessage.sender_id,
            },
        };
        setMessages(previousMessages => GiftedChat.append(previousMessages, [formattedMessage]));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId]);

  const onSend = useCallback(async (messages = []) => {
    const { text, user: msgUser } = messages[0];
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user!.id,
      content_plaintext: text,
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  }, [conversationId, user]);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FFD700" /></View>;
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: user!.id,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A192F',
    },
});

export default ChatScreen;
