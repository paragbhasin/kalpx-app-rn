import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";
import SocialPostCard from "../../components/SocialPostCard";
import {
  fetchPostDetail,
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  votePostDetail,
  voteComment
} from "../PostDetail/actions";
import moment from "moment";

const screenWidth = Dimensions.get("window").width;

const CommentItem = ({ comment, onReply, onEdit, onDelete, onVote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleUpdate = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  return (
    <View style={{ padding: 12, borderLeftWidth: comment.parent ? 1 : 0, borderLeftColor: '#eee', marginLeft: comment.parent ? 15 : 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Image
          source={{ uri: comment.creator?.avatar || "https://via.placeholder.com/24" }}
          style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#333' }}>{comment.creator_name || 'Anonymous'}</Text>
        <Text style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>{moment(comment.created_at).fromNow()}</Text>
      </View>

      {isEditing ? (
        <View style={{ padding: 8 }}>
          <TextInput
            value={editContent}
            onChangeText={setEditContent}
            multiline
            style={{ borderBottomWidth: 1, borderBottomColor: '#D69E2E', marginBottom: 8 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={{ marginRight: 15 }}>
              <Text style={{ color: '#666' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdate}>
              <Text style={{ color: '#D69E2E', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>{comment.content}</Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }} onPress={() => onVote(comment.id, 'upvote')}>
          <Ionicons name={comment.is_upvoted ? "arrow-up-circle" : "arrow-up-circle-outline"} size={16} color={comment.is_upvoted ? "#D69E2E" : "#666"} />
          <Text style={{ marginLeft: 4, fontSize: 12 }}>{comment.upvote_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onReply(comment)} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsEditing(true)} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDelete(comment.id)}>
          <Text style={{ fontSize: 12, color: 'red' }}>Delete</Text>
        </TouchableOpacity>
      </View>

      {comment.children && comment.children.map(child => (
        <CommentItem
          key={child.id}
          comment={child}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onVote={onVote}
        />
      ))}
    </View>
  );
};

export default function SocialPostDetailScreen() {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const { post: initialPost, isQuestion } = route.params || {};
  const { post, comments, loadingComments, loadingPost } = useSelector((state: any) => state.postDetail);

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);

  useEffect(() => {
    if (initialPost?.id) {
      dispatch(fetchPostDetail(initialPost.id) as any);
      dispatch(fetchComments(initialPost.id, 1, isQuestion) as any);
    }
  }, [initialPost?.id, dispatch, isQuestion]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    const res: any = await dispatch(createComment(post.id, commentText, replyingTo?.id, isQuestion) as any);
    if (res.success) {
      setCommentText("");
      setReplyingTo(null);
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const handleEditComment = (id, text) => {
    dispatch(updateComment(id, text) as any);
  };

  const handleDeleteComment = (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this comment?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteComment(id) as any) }
    ]);
  };

  const handleVoteComment = (id, type) => {
    dispatch(voteComment(id, type) as any);
  };

  if (!post && loadingPost) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D69E2E" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header />

      {/* Back Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 6, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: "600", marginLeft: 6, }}>Back to Feed</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {post && (
              <SocialPostCard
                post={post}
                onUpvote={() => dispatch(votePostDetail(post.id, 'upvote') as any)}
                onDownvote={() => dispatch(votePostDetail(post.id, 'downvote') as any)}
                onComment={() => {
                  if (isQuestion) {
                    navigation.setParams({ isQuestion: false });
                  }
                }}
                onAskQuestion={() => {
                  if (!isQuestion) {
                    navigation.setParams({ isQuestion: true });
                  }
                }}
              />
            )}
            <View style={{ padding: 15, backgroundColor: '#f9f9f9' }}>
              <Text style={{ fontWeight: 'bold' }}>{isQuestion ? 'Questions' : 'All Comments'}</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onReply={setReplyingTo}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onVote={handleVoteComment}
          />
        )}
        ListEmptyComponent={
          !loadingComments ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>
                {isQuestion ? "No questions yet. Be the first to ask!" : "No comments yet. Be the first to say something!"}
              </Text>
            </View>
          ) : (
            <ActivityIndicator style={{ padding: 40 }} color="#D69E2E" />
          )
        }
      />

      {/* Comment Input */}
      <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' }}>
        {replyingTo && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Replying to <Text style={{ fontWeight: 'bold' }}>{replyingTo.creator_name}</Text></Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text style={{ fontSize: 12, color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            placeholder={isQuestion ? "Ask a question..." : "Write a comment..."}
            style={{ flex: 1, minHeight: 40, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 }}
            multiline
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity
            style={{ marginLeft: 10, padding: 8 }}
            onPress={handlePostComment}
            disabled={!commentText.trim()}
          >
            <Ionicons name="send" size={24} color={commentText.trim() ? "#D69E2E" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
