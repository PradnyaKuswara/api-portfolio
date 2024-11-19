declare namespace CertificateNamespace {
  type bodyType = {
    uuid: string;
    name: string;
    organization: string;
    month_obtained: string;
    year_obtained: string;
    month_expired: string;
    year_expired: string;
    url: string;
    description: string;
  }

  interface Certificate {
    id: bigint,
    uuid: string,
    name: string,
    organization: String,
    month_obtained: string,
    year_obtained: string,
    month_expired: string,
    year_expired: string,
    url: string,
    description: string,
    createdAt: Date,
    updatedAt: Date
  }
}

export = CertificateNamespace;