import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FC, useState } from 'react';
import BlogHead from '../../components/BlogHead';
import BlogPost from '../../components/BlogPost';
import PostRecomendations from '../../components/PostsRecomendations';
import {
  getPostTags, getPublicBlogPostBySlug, getPublicBlogPosts, getRelatedPosts,
} from '../../lib/repository/blogPosts';
import { SerializedBlogPost } from '../../lib/types';
import { deserializeBlogPost, serializeBlogPost } from '../../lib/utils';

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  try {
    const blogPost = typeof slug === 'string' ? await getPublicBlogPostBySlug(slug) : await getPublicBlogPostBySlug(slug[0]);
    const relatedBlogPosts = await getRelatedPosts(blogPost);
    const path = blogPost.slug;
    const tags = await getPostTags();
    return {
      props: {
        postData: serializeBlogPost(blogPost),
        relatedPostsData: relatedBlogPosts.map((relatedPost) => serializeBlogPost(relatedPost)),
        tags,
        path,
      },
      revalidate: 5000,
    };
  } catch (err) {
    return {
      props: {
        postData: null,
      },
      revalidate: 5000,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const posts = await getPublicBlogPosts();
    const paths = posts.map((post) => ({
      params: { slug: post.slug },
    }));
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (err) {
    return null;
  }
};

type Props = {
  postData: SerializedBlogPost,
  relatedPostsData: SerializedBlogPost[],
  tags: string[],
}

const BlogPostPage : FC<Props> = (props: Props) => {
  const { postData, tags, relatedPostsData } = props;
  const [blogPost] = useState(deserializeBlogPost(postData));
  const [relatedPosts] = useState(relatedPostsData?.map((post) => deserializeBlogPost(post)));
  return (
    (!blogPost) ? <div>Loading...</div> : (
      <main className="main">
        <Head>
          <title>
            {blogPost.title}
            {' '}
            - Mapeo
          </title>
        </Head>
        <BlogHead tags={tags} />
        <BlogPost postData={blogPost} isPreview={false} />
        <PostRecomendations recomendedBlogPosts={relatedPosts} />
      </main>
    )
  );
};

export default BlogPostPage;
