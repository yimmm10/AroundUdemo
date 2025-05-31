import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function AdminAllUserCommentsScreen() {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [placesMap, setPlacesMap] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchPlacesAndComments();
  }, []);

  const fetchPlacesAndComments = async () => {
    try {
      const placesSnap = await getDocs(collection(db, 'places'));
      const map = {};
      placesSnap.forEach(doc => {
        const data = doc.data();
        if (data.id !== undefined && data.name) {
          map[String(data.id).trim()] = data.name;
        }
      });
      setPlacesMap(map);

      const commentsSnap = await getDocs(collection(db, 'comments'));
      const data = commentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setComments(data);
      setFilteredComments(data); // สำหรับการค้นหา
    } catch (error) {
      console.error('Error fetching comments or places:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = comments.filter(comment =>
      comment.text?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredComments(filtered);
  };

  const confirmDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteComment(id) }
    ]);
  };

  const deleteComment = async (id) => {
    try {
      await deleteDoc(doc(db, 'comments', id));
      const updated = comments.filter(item => item.id !== id);
      setComments(updated);
      setFilteredComments(updated);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingComment(item);
    setEditText(item.text || '');
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const commentRef = doc(db, 'comments', editingComment.id);
      await updateDoc(commentRef, { text: editText });

      const updated = comments.map(item =>
        item.id === editingComment.id ? { ...item, text: editText } : item
      );

      setComments(updated);
      setFilteredComments(updated);
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.user && <Text style={styles.username}>User: {item.user}</Text>}
      <Text style={styles.commentText}>Place: {placesMap[item.placeId] || 'Unknown'}</Text>
      <Text style={styles.commentText}>Comment: {item.text}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Users' Comments</Text>

      <TextInput
        placeholder="Search comments..."
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredComments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No comments found.</Text>}
      />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Modal visible={!!editingComment} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Comment</Text>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={saveEdit} style={styles.saveButton}>
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingComment(null)} style={styles.cancelButton}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  username: { fontWeight: 'bold', color: '#555' },
  commentText: { fontSize: 16, marginTop: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  editButton: { marginRight: 10, backgroundColor: '#4caf50', padding: 6, borderRadius: 5 },
  deleteButton: { backgroundColor: '#f44336', padding: 6, borderRadius: 5 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  backButton: {
    marginTop: 20,
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5, marginRight: 10 },
  cancelButton: { backgroundColor: '#aaa', padding: 8, borderRadius: 5 },
});
