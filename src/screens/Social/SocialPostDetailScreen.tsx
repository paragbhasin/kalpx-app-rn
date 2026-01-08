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
  voteComment,
  markCommentUseful,
  savePostDetail,
  unsavePostDetail,
  hidePostDetail,
  reportContent
} from "../PostDetail/actions";
import moment from "moment";

const screenWidth = Dimensions.get("window").width;

const CommentItem = ({ comment, onReply, onEdit, onDelete, onVote, onUseful, onReport, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [showUsefulMessage, setShowUsefulMessage] = useState(false);

  const isOtherUser = currentUserId && comment.creator?.id !== currentUserId;

  const handleUseful = () => {
    onUseful(comment.id);
    setShowUsefulMessage(true);
    setTimeout(() => setShowUsefulMessage(false), 2000);
  };

  const handleUpdate = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  return (
    <View style={{ padding: 12, borderLeftWidth: comment.parent ? 1 : 0, borderLeftColor: '#eee', marginLeft: comment.parent ? 15 : 0, zIndex: showMenu ? 10 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
       {comment.creator?.avatar ? (
    <Image
      source={{ uri: comment.creator.avatar }}
      style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
    />
  ) : (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#D69E2E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
        {(
          comment.creator?.username?.split('@')[0]?.charAt(0) || 'A'
        ).toUpperCase()}
      </Text>
    </View>
  )}
        <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#333' }}>
          {(comment.creator.username && comment.creator.username.split('@')[0]) || 'Anonymous'}
        </Text>
        <Text style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>{moment(comment.created_at).fromNow()}</Text>
        {comment.useful_count > 0 && (
          <View style={{ marginLeft: 'auto', backgroundColor: '#FFFDF0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FDF5E9' }}>
            <Ionicons name="star" size={12} color="#D69E2E" />
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#D69E2E', marginLeft: 4 }}>{comment.useful_count} Useful</Text>
          </View>
        )}
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
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, marginRight: 15 }}>
          <TouchableOpacity onPress={() => onVote(comment.id, 'upvote')} style={{ paddingRight: 8 }}>
            <Ionicons
              name={comment.user_vote === 1 ? "arrow-up-bold" : "arrow-up-outline"}
              size={18}
              color={comment.user_vote === 1 ? "#D69E2E" : "#666"}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: comment.user_vote === 1 ? "#D69E2E" : comment.user_vote === -1 ? "#946100" : "#666" }}>
            {comment.score || 0}
          </Text>
          <TouchableOpacity onPress={() => onVote(comment.id, 'downvote')} style={{ paddingLeft: 8 }}>
            <Ionicons
              name={comment.user_vote === -1 ? "arrow-down-bold" : "arrow-down-outline"}
              size={18}
              color={comment.user_vote === -1 ? "#946100" : "#666"}
            />
          </TouchableOpacity>
        </View> */}

        <TouchableOpacity onPress={() => onReply(comment)} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 12, color: '#666' }}>Reply</Text>
        </TouchableOpacity>

        {isOtherUser && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
            onPress={handleUseful}
          >
            <Ionicons
              name={comment.is_useful_marked ? "star" : "star-outline"}
              size={18}
              color={comment.is_useful_marked ? "#D69E2E" : "#666"}
            />
            <Text style={{ marginLeft: 4, fontSize: 12, color: comment.is_useful_marked ? "#D69E2E" : "#666", fontWeight: comment.is_useful_marked ? 'bold' : 'normal' }}>Useful</Text>
          </TouchableOpacity>
        )}

        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>

          {showMenu && (
            <>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: -Dimensions.get('window').height,
                  bottom: -Dimensions.get('window').height,
                  left: -Dimensions.get('window').width,
                  right: -Dimensions.get('window').width,
                  zIndex: 999,
                }}
                onPress={() => setShowMenu(false)}
              />
            <View
              style={{
                position: 'absolute',
                  top: 25,
                right: 0,
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 12,
                minWidth: 100,
                  zIndex: 1000,
                  elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                borderWidth: 1,
                borderColor: '#f0f0f0',
              }}
            >
              {!isOtherUser ? (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}
                  >
                    <Text style={{ fontSize: 14, color: '#333' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onDelete(comment.id);
                      setShowMenu(false);
                    }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ fontSize: 14, color: '#FF3B30' }}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false);
                    // For now, directly call onReport with a placeholder reason/details
                    // In a real app, this would open a modal for user to select reason/details
                    Alert.alert(
                      "Report Comment",
                      "Are you sure you want to report this comment?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Report",
                          style: "destructive",
                          onPress: () => onReport(comment.id, "spam", "User reported as spam from menu.")
                        }
                      ]
                    );
                  }}
                  style={{ paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 14, color: '#FF3B30' }}>Report</Text>
                </TouchableOpacity>
              )}
            </View>
            </>
          )}
        </View>
      </View>

      {showUsefulMessage && (
        <Text style={{ fontSize: 12, color: '#2E7D32', marginTop: 4, fontWeight: '500' }}>Marked as useful!</Text>
      )}

      {comment.children && comment.children.map(child => (
        <CommentItem
          key={child.id}
          comment={child}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onVote={onVote}
          onUseful={onUseful}
          onReport={onReport}
          currentUserId={currentUserId}
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
  const profileDetails = useSelector((state: any) => state.profileDetailsReducer);
  const currentUserId = profileDetails?.data?.id;

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

  const handleUsefulComment = (id) => {
    dispatch(markCommentUseful(id) as any);
  };

  const handleReportComment = (id, reason, details) => {
    dispatch(reportContent('comment', id, reason, details) as any);
    Alert.alert("Reported", "Thank you for reporting. We will review this comment.");
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
                onSave={() => dispatch(savePostDetail(post.id) as any)}
                onUnsave={() => dispatch(unsavePostDetail(post.id) as any)}
                onHide={() => {
                  dispatch(hidePostDetail(post.id) as any);
                  navigation.goBack();
                }}
                onReport={(reason, details) => {
                  dispatch(reportContent('post', post.id, reason, details) as any);
                  Alert.alert("Reported", "Thank you for reporting. We will review this post.");
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
            onUseful={handleUsefulComment}
            onReport={handleReportComment}
            currentUserId={currentUserId}
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
        contentContainerStyle={{ paddingBottom: 100 }}
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
