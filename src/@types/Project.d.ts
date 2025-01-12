declare namespace ProjectNamespace {
  type bodyType = {
    uuid: string,
    project_category_id: number,
    title: string;
    image: string;
    slug: string;
    description: string;
    stack: string;
    link_github: string | null;
    link_project: string | null;
    link_documentation: string | null;
    meta_desc: string;
    meta_keyword: string;
  }

  interface ProjectCategory {
    id: bigint;
    uuid: string;
    name: string;
    createdAt: Date,
    updatedAt: Date,
  }

  interface Project {
    id: bigint;
    uuid: string;
    project_category_id: bigint;
    title: string;
    image: string;
    slug: string;
    description: string;
    stack: string,
    link_github: string | null,
    link_project: string | null,
    link_documentation: string | null,
    is_active: boolean,
    meta_desc: string,
    meta_keyword: string | null,
    createdAt: Date,
    updatedAt: Date,

    ProjectCategory: ProjectCategory
  }
}

export = ProjectNamespace;