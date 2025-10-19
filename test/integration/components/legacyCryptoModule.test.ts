/**
 * Integration tests for LegacyCryptoModule
 * Tests the adapter that bridges React Native's cipherKey configuration to ICryptoModule
 */

import { expect } from 'chai';
import { Buffer } from 'buffer';
import LegacyCryptoModule from '../../../src/crypto/modules/LegacyCryptoModule';
import LegacyCrypto from '../../../src/core/components/cryptography/index';

// Mock logger manager for testing
class MockLoggerManager {
  debug = () => {};
  info = () => {};
  warn = () => {};
  error = () => {};
}

describe('LegacyCryptoModule Integration Tests', () => {
  let legacyCrypto: LegacyCrypto;
  let cryptoModule: LegacyCryptoModule;
  const testCipherKey = 'test-cipher-key-123';
  const mockLogger = new MockLoggerManager();

  beforeEach(() => {
    // Create legacy crypto instance with test configuration
    legacyCrypto = new LegacyCrypto({
      cipherKey: testCipherKey,
      useRandomIVs: false, // Use predictable IVs for testing
      logger: mockLogger,
    });

    // Create crypto module with legacy instance
    cryptoModule = new LegacyCryptoModule(legacyCrypto);
  });

  describe('Constructor', () => {
    it('should create instance with valid legacy crypto', () => {
      const module = new LegacyCryptoModule(legacyCrypto);
      expect(module).to.be.instanceOf(LegacyCryptoModule);
    });

    it('should throw error when legacy crypto is null', () => {
      expect(() => new LegacyCryptoModule(null as any)).to.throw('Legacy crypto instance is required');
    });

    it('should throw error when legacy crypto is undefined', () => {
      expect(() => new LegacyCryptoModule(undefined as any)).to.throw('Legacy crypto instance is required');
    });
  });

  describe('Logger Management', () => {
    it('should set logger on legacy crypto instance', () => {
      const newLogger = new MockLoggerManager();
      cryptoModule.logger = newLogger;
      expect(legacyCrypto.logger).to.equal(newLogger);
    });
  });

  describe('String Encryption/Decryption', () => {
    it('should encrypt and decrypt string data', () => {
      const testData = '"Hello, World!"'; // JSON string

      const encrypted = cryptoModule.encrypt(testData);
      expect(encrypted).to.be.a('string');
      expect(encrypted).to.not.equal(testData);

      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.equal('Hello, World!'); // Legacy crypto parses JSON, so we get the unwrapped string
    });

    it('should handle complex string data', () => {
      const originalData = {
        message: 'Complex data with special characters: éñ中文🚀',
        numbers: [1, 2.5, -3],
        boolean: true,
        nested: { key: 'value' }
      };
      const testData = JSON.stringify(originalData);

      const encrypted = cryptoModule.encrypt(testData);
      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.deep.equal(originalData); // Legacy crypto parses JSON
    });

    it('should handle empty string', () => {
      const testData = '""'; // JSON empty string

      const encrypted = cryptoModule.encrypt(testData);
      expect(encrypted).to.be.a('string');

      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.equal(''); // Parsed JSON result
    });

    it('should handle long strings', () => {
      const longString = 'x'.repeat(10000);
      const testData = JSON.stringify(longString);

      const encrypted = cryptoModule.encrypt(testData);
      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.equal(longString); // Parsed JSON result
    });
  });

  describe('ArrayBuffer Encryption/Decryption', () => {
    it('should encrypt and decrypt ArrayBuffer data', () => {
      const testString = 'ArrayBuffer test data';
      const testData = new TextEncoder().encode(JSON.stringify(testString)).buffer;

      const encrypted = cryptoModule.encrypt(testData);
      expect(encrypted).to.be.a('string');

      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.equal(testString); // Legacy crypto parses JSON
    });

    it('should handle empty ArrayBuffer', () => {
      const testData = new TextEncoder().encode('""').buffer; // JSON empty string as ArrayBuffer

      const encrypted = cryptoModule.encrypt(testData);
      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.equal(''); // Parsed JSON result
    });

    it('should handle binary ArrayBuffer data', () => {
      const testString = 'binary test';
      const testData = new TextEncoder().encode(JSON.stringify(testString)).buffer;

      const encrypted = cryptoModule.encrypt(testData);
      expect(encrypted).to.be.a('string');

      // When decrypting ArrayBuffer data containing JSON, we get parsed JSON
      const decrypted = cryptoModule.decrypt(encrypted as string);
      expect(decrypted).to.equal(testString);
    });
  });

  describe('Decryption with ArrayBuffer input', () => {
    it('should decrypt ArrayBuffer input', () => {
      const testData = 'Test for ArrayBuffer decryption';
      const jsonData = JSON.stringify(testData);

      // First encrypt as string to get valid encrypted data
      const encrypted = cryptoModule.encrypt(jsonData);

      // The LegacyCryptoModule expects ArrayBuffer to contain bytes that when converted
      // to base64 will match the encrypted string. So we need to create an ArrayBuffer
      // from the base64-decoded bytes of the encrypted string.
      const encryptedBytes = Buffer.from(encrypted as string, 'base64');
      const encryptedBuffer = encryptedBytes.buffer.slice(encryptedBytes.byteOffset, encryptedBytes.byteOffset + encryptedBytes.byteLength);

      const decrypted = cryptoModule.decrypt(encryptedBuffer);
      expect(decrypted).to.equal(testData); // Parsed JSON result
    });

    it('should handle empty ArrayBuffer for decryption', () => {
      const emptyBuffer = new ArrayBuffer(0);

      expect(() => cryptoModule.decrypt(emptyBuffer))
        .to.throw('Decryption data cannot be empty ArrayBuffer');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for null encryption data', () => {
      expect(() => cryptoModule.encrypt(null as any))
        .to.throw('Encryption data cannot be null or undefined');
    });

    it('should throw error for undefined encryption data', () => {
      expect(() => cryptoModule.encrypt(undefined as any))
        .to.throw('Encryption data cannot be null or undefined');
    });

    it('should throw error for null decryption data', () => {
      expect(() => cryptoModule.decrypt(null as any))
        .to.throw('Decryption data cannot be null or undefined');
    });

    it('should throw error for undefined decryption data', () => {
      expect(() => cryptoModule.decrypt(undefined as any))
        .to.throw('Decryption data cannot be null or undefined');
    });

    it('should throw error for empty string decryption', () => {
      expect(() => cryptoModule.decrypt(''))
        .to.throw('Decryption data cannot be empty string');
    });

    it('should throw error for whitespace-only string decryption', () => {
      expect(() => cryptoModule.decrypt('   '))
        .to.throw('Decryption data cannot be empty string');
    });

    it('should handle malformed encrypted data gracefully', () => {
      const malformedData = 'not-valid-encrypted-data';

      // Legacy crypto returns null for malformed data, doesn't throw
      const result = cryptoModule.decrypt(malformedData);
      expect(result).to.be.null;
    });

    it('should handle encryption failure gracefully', () => {
      // Mock the legacy crypto to throw an error
      const failingCrypto = new LegacyCrypto({
        cipherKey: testCipherKey,
        useRandomIVs: false,
        logger: mockLogger,
      });

      // Override encrypt method to throw
      failingCrypto.encrypt = () => {
        throw new Error('Encryption failed');
      };

      const failingModule = new LegacyCryptoModule(failingCrypto);

      expect(() => failingModule.encrypt(JSON.stringify('test')))
        .to.throw(/Encryption failed: Encryption failed/);
    });
  });

  describe('File Operations', () => {
    // Mock file interfaces for testing
    const mockFile = {
      name: 'test.txt',
      content: 'test content'
    } as any;

    const mockFileConstructor = class {} as any;

    it('should return undefined for encryptFile', async () => {
      const result = await cryptoModule.encryptFile(mockFile, mockFileConstructor);
      expect(result).to.be.undefined;
    });

    it('should return undefined for decryptFile', async () => {
      const result = await cryptoModule.decryptFile(mockFile, mockFileConstructor);
      expect(result).to.be.undefined;
    });
  });

  describe('Cross-format Compatibility', () => {
    it('should maintain compatibility with different cipher keys', () => {
      const data = 'Compatibility test';
      const jsonData = JSON.stringify(data);

      // Test with different cipher key
      const crypto2 = new LegacyCrypto({
        cipherKey: 'different-key',
        useRandomIVs: false,
        logger: mockLogger,
      });
      const module2 = new LegacyCryptoModule(crypto2);

      const encrypted1 = cryptoModule.encrypt(jsonData);
      const encrypted2 = module2.encrypt(jsonData);

      // Different keys should produce different encrypted data
      expect(encrypted1).to.not.equal(encrypted2);

      // But each should decrypt correctly with its own key
      expect(cryptoModule.decrypt(encrypted1 as string)).to.equal(data);
      expect(module2.decrypt(encrypted2 as string)).to.equal(data);
    });

    it('should handle useRandomIVs setting correctly', () => {
      const data = 'Random IV test';
      const jsonData = JSON.stringify(data);

      // Test with random IVs enabled
      const cryptoRandom = new LegacyCrypto({
        cipherKey: testCipherKey,
        useRandomIVs: true,
        logger: mockLogger,
      });
      const moduleRandom = new LegacyCryptoModule(cryptoRandom);

      const encrypted1 = moduleRandom.encrypt(jsonData);
      const encrypted2 = moduleRandom.encrypt(jsonData);

      // With random IVs, same data should produce different encrypted output
      expect(encrypted1).to.not.equal(encrypted2);

      // But both should decrypt to original data
      expect(moduleRandom.decrypt(encrypted1 as string)).to.equal(data);
      expect(moduleRandom.decrypt(encrypted2 as string)).to.equal(data);
    });
  });

  describe('React Native Environment Simulation', () => {
    it('should work with polyfilled Buffer', () => {
      // Simulate React Native environment where Buffer might be polyfilled
      const originalBuffer = global.Buffer;

      try {
        // Set Buffer to the polyfill
        global.Buffer = Buffer;

        const testData = 'Buffer polyfill test';
        const jsonData = JSON.stringify(testData);
        const encrypted = cryptoModule.encrypt(jsonData);
        const decrypted = cryptoModule.decrypt(encrypted as string);

        expect(decrypted).to.equal(testData);
      } finally {
        // Restore original Buffer
        global.Buffer = originalBuffer;
      }
    });

    it('should handle UTF-8 encoding correctly in RN environment', () => {
      const testData = 'Unicode test: éñ中文🚀 emoji and special chars';
      const jsonData = JSON.stringify(testData);

      const encrypted = cryptoModule.encrypt(jsonData);
      const decrypted = cryptoModule.decrypt(encrypted as string);

      expect(decrypted).to.equal(testData);
    });

    it('should work with TextEncoder/TextDecoder polyfills', () => {
      // Test with polyfilled TextEncoder/TextDecoder (common in RN)
      const testString = 'TextEncoder/Decoder test';
      const jsonString = JSON.stringify(testString);
      const encoder = new TextEncoder();
      const testData = encoder.encode(jsonString).buffer;

      const encrypted = cryptoModule.encrypt(testData);
      const decrypted = cryptoModule.decrypt(encrypted as string);

      expect(decrypted).to.equal(testString);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple rapid encrypt/decrypt operations', () => {
      const testData = 'Performance test data';
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const jsonData = JSON.stringify(`${testData} ${i}`);
        const encrypted = cryptoModule.encrypt(jsonData);
        const decrypted = cryptoModule.decrypt(encrypted as string);
        expect(decrypted).to.equal(`${testData} ${i}`);
      }
    });

    it('should handle large data efficiently', () => {
      // Test with large data (smaller for JSON overhead)
      const largeData = 'x'.repeat(100000);
      const jsonData = JSON.stringify(largeData);

      const startTime = Date.now();
      const encrypted = cryptoModule.encrypt(jsonData);
      const decrypted = cryptoModule.decrypt(encrypted as string);
      const endTime = Date.now();

      expect(decrypted).to.equal(largeData);
      expect(endTime - startTime).to.be.lessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with null bytes', () => {
      const testData = 'Data\0with\0null\0bytes';
      const jsonData = JSON.stringify(testData);

      const encrypted = cryptoModule.encrypt(jsonData);
      const decrypted = cryptoModule.decrypt(encrypted as string);

      expect(decrypted).to.equal(testData);
    });

    it('should handle JSON-like strings', () => {
      const testData = '{"key": "value", "nested": {"array": [1, 2, 3]}}';
      const jsonData = JSON.stringify(testData); // Double-encode as JSON

      const encrypted = cryptoModule.encrypt(jsonData);
      const decrypted = cryptoModule.decrypt(encrypted as string);

      expect(decrypted).to.equal(testData); // Should get back the JSON string
    });

    it('should handle base64-like strings', () => {
      const testData = 'SGVsbG8gV29ybGQh'; // "Hello World!" in base64
      const jsonData = JSON.stringify(testData);

      const encrypted = cryptoModule.encrypt(jsonData);
      const decrypted = cryptoModule.decrypt(encrypted as string);

      expect(decrypted).to.equal(testData);
    });
  });
});