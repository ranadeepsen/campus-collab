"use client";

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function PollViewer({ postId, pollData, currentUserAccess }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Array of selected option IDs (supports single and multi)
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    fetchResults();
  }, [postId]);

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/polls/${postId}/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.myVotes && data.myVotes.length > 0) {
          setSelectedOptions(data.myVotes);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasVoted = results?.myVotes && results.myVotes.length > 0;
  const isExpired = pollData?.expiresAt && new Date(pollData.expiresAt) < new Date();
  
  // Only verified current students can vote
  const canVote = currentUserAccess?.canPost && !hasVoted && !isExpired;
  
  const showResults = hasVoted || isExpired || !currentUserAccess?.canPost;

  const handleOptionClick = (optionId) => {
    if (!canVote) return;
    
    if (pollData.allowMultipleSelection) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      // Single vote -> auto submit on click
      submitVote([optionId]);
    }
  };

  const handleMultiSubmit = () => {
    if (selectedOptions.length === 0) return;
    submitVote(selectedOptions);
  };

  const submitVote = async (optionIds) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/polls/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds })
      });
      if (res.ok) {
        // Optimistically update or refetch
        await fetchResults();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to vote");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#5D22D7]" /></div>;
  }

  // Calculate days left
  let countdownText = null;
  if (pollData.expiresAt) {
    const daysLeft = Math.ceil((new Date(pollData.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) countdownText = `${daysLeft} days left`;
    else countdownText = "Poll closed";
  }

  return (
    <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 mt-2">
      <h3 className="font-bold text-[15px] text-gray-900 mb-4">{pollData.question}</h3>
      
      <div className="space-y-2.5">
        {!showResults ? (
          // VOTING UI
          <>
            {pollData.options.map((option) => {
              const isSelected = selectedOptions.includes(option._id);
              return (
                <button
                  key={option._id}
                  onClick={() => handleOptionClick(option._id)}
                  disabled={submitting}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'border-[#5D22D7] bg-[#F0EBFD]' 
                      : 'border-gray-200 bg-white hover:border-[#5D22D7]/50'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-[#5D22D7]' : 'text-gray-700'}`}>
                    {option.text}
                  </span>
                  {pollData.allowMultipleSelection && (
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#5D22D7] border-[#5D22D7]' : 'border-gray-300'}`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  )}
                </button>
              );
            })}
            
            {pollData.allowMultipleSelection && (
              <div className="pt-2">
                <button
                  onClick={handleMultiSubmit}
                  disabled={selectedOptions.length === 0 || submitting}
                  className="w-full bg-[#5D22D7] hover:bg-[#4C1D95] text-white py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Vote"}
                </button>
              </div>
            )}
          </>
        ) : (
          // RESULTS UI
          <>
            {results?.results?.map((res) => {
              const isMyChoice = results.myVotes.includes(res.optionId);
              return (
                <div key={res.optionId} className="relative w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Progress Bar Fill */}
                  <div 
                    className={`absolute top-0 left-0 h-full ${isMyChoice ? 'bg-[#F0EBFD]' : 'bg-gray-100'} transition-all duration-500`} 
                    style={{ width: `${res.percentage}%` }}
                  />
                  
                  {/* Content (Z-index ensures it sits above progress fill) */}
                  <div className="relative z-10 flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{res.text}</span>
                      {isMyChoice && <CheckCircle2 className="w-3.5 h-3.5 text-[#5D22D7]" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 font-medium">{res.count} votes</span>
                      <span className="text-sm font-bold text-gray-900 min-w-[36px] text-right">{res.percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        <span>{results?.totalVotes || 0} votes</span>
        {countdownText && (
          <>
            <span>•</span>
            <span className={countdownText === "Poll closed" ? "text-red-500" : ""}>{countdownText}</span>
          </>
        )}
      </div>
    </div>
  );
}
