import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageSquare, Send } from 'lucide-react';

export default function ClubFeed({ clubId, myRole, clubName }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentContents, setCommentContents] = useState({});
  const [commentingId, setCommentingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [clubId]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/clubs/${clubId}/posts`);
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/clubs/${clubId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        setContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (postId) => {
    const text = commentContents[postId];
    if (!text?.trim()) return;
    
    setCommentingId(postId);
    try {
      const res = await fetch(`/api/clubs/${clubId}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        setCommentContents(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentingId(null);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading feed...</div>;

  return (
    <div className="space-y-6">
      {myRole === 'admin' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <form onSubmit={handlePost}>
            <textarea
              placeholder={`Post an official announcement as ${clubName}...`}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7] transition-all resize-none mb-3"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={posting || !content.trim()}
                className="bg-[#5D22D7] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#4C1D95] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#5D22D7] to-[#7B2CBF] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {clubName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{clubName}</h4>
                    <span className="bg-[#5D22D7] text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Official</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>
              
              {/* Comments Section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Comments ({post.comments?.length || 0})</h5>
                
                <div className="space-y-3 mb-4">
                  {(post.comments || []).map(comment => (
                    <div key={comment._id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0 overflow-hidden">
                        {comment.user?.profile?.photo && <img src={comment.user.profile.photo} alt="photo" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900">{comment.user?.profile?.name || comment.user?.firstName}</span>
                          <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {(myRole === 'admin' || myRole === 'member') && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D22D7]/20 focus:border-[#5D22D7]"
                      value={commentContents[post._id] || ''}
                      onChange={e => setCommentContents(prev => ({ ...prev, [post._id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(post._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      disabled={commentingId === post._id || !(commentContents[post._id] || '').trim()}
                      className="p-2 rounded-full bg-[#5D22D7] text-white disabled:opacity-50 hover:bg-[#4C1D95] transition-colors shrink-0"
                    >
                      {commentingId === post._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
