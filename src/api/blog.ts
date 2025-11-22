
import { BlogPost } from '../types';
import { mockBlogPosts } from '../data/mockBlog';

export const getBlogPosts = async (): Promise<BlogPost[]> => {
    console.log("Fetching mock blog posts...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockBlogPosts;
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
    console.log(`Fetching mock blog post with slug: ${slug}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const post = mockBlogPosts.find(p => p.slug === slug);
    if (post) {
        return post;
    }
    throw new Error('Post not found');
};
