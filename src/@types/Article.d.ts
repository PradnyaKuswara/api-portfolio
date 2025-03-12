declare namespace ArticleNamespace {
  type bodyType = {
    uuid: string,
    title: string;
    thumbnail: string;
    slug: string;
    content: string;
    meta_desc: string;
    meta_keyword: string;
    tags: string;
  }

  interface Tag {
    id: bigint,
    uuid: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
  }

  interface ArticleTag {
    Tag: Tag
  }

  interface Article {
    id: bigint,
    uuid: string,
    title: string,
    thumbnail: string,
    slug: string,
    content: string,
    meta_desc: string,
    meta_keyword: string | null,
    is_active: boolean,
    createdAt: Date,
    updatedAt: Date,
    tags: ArticleTag[]
  }
}

export = ArticleNamespace;
