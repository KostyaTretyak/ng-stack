import { Validators } from './validators';

describe('Validators', () => {
  describe('fileRequired', () => {
    it('null as value', () => {
      const validator = Validators.fileRequired;
      expect(validator({ value: null } as any)).toEqual({ fileRequired: true });
    });

    it('some object as value', () => {
      const validator = Validators.fileRequired;
      expect(validator({ value: { one: 1 } } as any)).toEqual({ fileRequired: true });
    });

    it('one file as value', () => {
      const content = '1'.repeat(10);

      const formData = new FormData();
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.fileRequired;
      expect(validator({ value: formData } as any)).toBe(null);
    });
  });

  describe('filesMinLength', () => {
    it('one file when expected min one file', () => {
      const minLength = 1;

      const formData = new FormData();
      const file = new File([], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.filesMinLength(minLength);
      expect(validator({ value: formData } as any)).toBe(null);
    });

    it('one file when expected min two files', () => {
      const minLength = 2;
      const actualLength = 1;

      const formData = new FormData();
      const file = new File([], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.filesMinLength(minLength);
      const err = { filesMinLength: { requiredLength: minLength, actualLength } };
      expect(validator({ value: formData } as any)).toEqual(err);
    });
  });

  describe('filesMaxLength', () => {
    it('one file when expected max one file', () => {
      const maxLength = 1;

      const formData = new FormData();
      const file = new File([], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.filesMaxLength(maxLength);
      expect(validator({ value: formData } as any)).toBe(null);
    });

    it('three files when expected max two files', () => {
      const maxLength = 2;
      const actualLength = 3;

      const formData = new FormData();
      const file = new File([], 'any-name.jpg');
      formData.append('fileUpload', file);
      formData.append('fileUpload', file);
      formData.append('fileUpload', file);
      const validator = Validators.filesMaxLength(maxLength);
      const err = { filesMaxLength: { requiredLength: maxLength, actualLength } };
      expect(validator({ value: formData } as any)).toEqual(err);
    });
  });

  describe('fileMaxSize', () => {
    it('null as content', () => {
      const maxSize = 10;
      const content = null as any;

      const formData = new FormData();
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.fileMaxSize(maxSize);
      expect(validator({ value: formData } as any)).toBe(null);
    });

    it('empty content', () => {
      const maxSize = 10;
      const content = '';

      const formData = new FormData();
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.fileMaxSize(maxSize);
      expect(validator({ value: formData } as any)).toBe(null);
    });

    it('acceptable content', () => {
      const maxSize = 10;
      const content = '1'.repeat(10);

      const formData = new FormData();
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.fileMaxSize(maxSize);
      expect(validator({ value: formData } as any)).toBe(null);
    });

    it('exceeded max size', () => {
      const maxSize = 10;
      const actualSize = 11;
      const content = '1'.repeat(actualSize);

      const formData = new FormData();
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'any-name.jpg');
      formData.append('fileUpload', file);
      const validator = Validators.fileMaxSize(maxSize);
      const err = { fileMaxSize: { requiredSize: maxSize, actualSize, file } };
      expect(validator({ value: formData } as any)).toEqual(err);
    });
  });
});
