declare namespace TagNamespace {
  type bodyType = {
    uuid: string;
    name: string;
  };

  interface Tag {
    id: bigint;
    uuid: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

export = TagNamespace;
