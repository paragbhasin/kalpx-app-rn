import { useState, useCallback, useEffect, useRef } from "react";
import api from "../Networks/axios";
import axios from "axios";

export function useGlobalSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [scopedCommunity, setScopedCommunity] = useState<{ slug: string } | null>(null);
    const [results, setResults] = useState<{
        communities: any[];
        posts: any[];
        users: any[];
    }>({
        communities: [],
        posts: [],
        users: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const performSearch = useCallback(async (query: string) => {
        if (!query || query.trim().length === 0) {
            setResults({ communities: [], posts: [], users: [] });
            setLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            let url = `/community-search/global_search/?q=${encodeURIComponent(query)}`;
            if (scopedCommunity) {
                url += `&community=${scopedCommunity.slug}`;
            }

            const res = await api.get(url, {
                signal: abortControllerRef.current.signal,
            });

            setResults({
                communities: res.data.communities || [],
                posts: res.data.posts || [],
                users: res.data.users || [],
            });
        } catch (err: any) {
            if (err.name === "AbortError" || axios.isCancel(err)) {
                console.log("Search request canceled");
            } else {
                console.error("Global search error:", err);
                setError("Failed to perform search");
                setResults({ communities: [], posts: [], users: [] });
            }
        } finally {
            // Only set loading false if this wasn't an aborted request
            // But actually, in React, we might want to be careful with state updates on unmounted or aborted components.
            // For now, simple loading state update.
            setLoading(false);
        }
    }, [scopedCommunity]);

    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setResults({ communities: [], posts: [], users: [] });
            setLoading(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            performSearch(searchQuery);
        }, 500);

        return () => {
            clearTimeout(delayDebounceFn);
        };
    }, [searchQuery, performSearch]);

    return {
        searchQuery,
        setSearchQuery,
        scopedCommunity,
        setScopedCommunity,
        results,
        loading,
        error,
        performSearch,
    };
}
