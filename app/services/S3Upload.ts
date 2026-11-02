import axios from 'axios';

export interface PresignedPost {
  url: string;
  fields: Record<string, string>;
}

export class S3Upload {
  static form(post: PresignedPost, file: File): FormData {
    const form = new FormData();

    for (const [name, value] of Object.entries(post.fields)) {
      form.append(name, value);
    }
    // S3 ignores any field after the file.
    form.append('file', file);

    return form;
  }

  // Bare axios: S3 takes no cookie and no Authorization. No Content-Type either: the browser writes
  // multipart/form-data with this body's boundary.
  static async post(
    post: PresignedPost,
    file: File,
    onProgress: (fraction: number) => void,
  ): Promise<void> {
    await axios.post(post.url, S3Upload.form(post, file), {
      onUploadProgress: ({ loaded, total }) => {
        if (total) {
          onProgress(loaded / total);
        }
      },
    });
  }
}
