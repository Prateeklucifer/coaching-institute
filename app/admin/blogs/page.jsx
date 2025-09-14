"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BlogManagement() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paragraphOne: '',
    paragraphTwo: '',
    paragraphThree: '',
    coverImage: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.blogs);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (error) {
      setError('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingId 
        ? `/api/admin/blog/${editingId}`
        : '/api/admin/blog';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          paragraphOne: '',
          paragraphTwo: '',
          paragraphThree: '',
          coverImage: ''
        });
        setEditingId(null);
        fetchBlogs();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save blog');
      }
    } catch (error) {
      setError('Error saving blog');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      description: blog.description,
      paragraphOne: blog.paragraphOne,
      paragraphTwo: blog.paragraphTwo,
      paragraphThree: blog.paragraphThree,
      coverImage: blog.coverImage
    });
    setEditingId(blog._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchBlogs();
      } else {
        setError('Failed to delete blog');
      }
    } catch (error) {
      setError('Error deleting blog');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div> */}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blog Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              paragraphOne: '',
              paragraphTwo: '',
              paragraphThree: '',
              coverImage: ''
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add New Blog'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              maxLength={500}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraph One
            </label>
            <textarea
              name="paragraphOne"
              value={formData.paragraphOne}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraph Two
            </label>
            <textarea
              name="paragraphTwo"
              value={formData.paragraphTwo}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraph Three
            </label>
            <textarea
              name="paragraphThree"
              value={formData.paragraphThree}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingId ? 'Update Blog' : 'Create Blog')}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(blog => (
          <div key={blog._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-48">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{blog.description}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEdit(blog)}
                  className="text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No blogs found. Create your first blog post!
        </div>
      )}
    </div>
  );
}
