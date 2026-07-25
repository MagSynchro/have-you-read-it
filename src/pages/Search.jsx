import React, { useEffect, useState } from "react";
import { redditFetch } from "../utils/redditFetch.js";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import Breadcrumbs from "../components/Breadcrumbs";
import "../styles/Search.css";

export default function Search(){
    const location = useLocation();
    const [posts, setSPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const query = new URLSearchParams(location.search).get("q");
        const breadcrumbPath = [
        { name: "Home", url: "/" },
        { name: `Search: ${query}`, url: `/search?q=${query}` }
    ];

    useEffect(() => {
        async function fetchSearchResults() {
            if (!query) return;
            setIsLoading(true);
            const json = await redditFetch({ query });
            const results = json.data.children.map(post => post.data);
            setSPosts(results);
            setIsLoading(false);
        }
        fetchSearchResults();
    }, [query]);

    if (isLoading) return (
        <div className="loading-overlay">Loading results...</div>
    );

    return (
        <div className="search-page">            
            <Breadcrumbs path={breadcrumbPath} />

            {posts.length === 0 ? (
                <p>No results found.</p>
            ) : (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            
            )}
        </div>
    )
}