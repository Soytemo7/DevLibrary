export type ResourceType =
  | 'WEB_PAGE'
  | 'COMPONENT'
  | 'SNIPPET'
  | 'DOCUMENTATION'
  | 'VIDEO'
  | 'TOOL'
  | 'GITHUB_REPOSITORY'
  | 'ARTICLE'
  | 'OTHER'

export interface Category {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
}

export interface Resource {
  _id: string
  title: string
  slug: string
  description: string
  url: string
  image?: string
  favicon?: string
  type: ResourceType
  category?: Category
  tags: string[]
  technologies: string[]
  notes?: string
  favorite: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}