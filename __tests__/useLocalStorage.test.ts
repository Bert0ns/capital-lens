import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes with default value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('defaultValue');
  });

  it('initializes with value from localStorage if exists', () => {
    window.localStorage.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('updates state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(window.localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'));
  });

  it('handles functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem('count')).toBe('1');
  });

  it('handles JSON.parse error gracefully on load', () => {
    // Put invalid JSON in localStorage
    window.localStorage.setItem('testKey', 'invalid-json');
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(console.warn).toHaveBeenCalledWith(
      'Error reading localStorage key "testKey":',
      expect.any(SyntaxError)
    );
  });

  it('handles JSON.stringify error gracefully on save', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', {}));

    // Create a circular structure that JSON.stringify cannot serialize
    const circularObj: Record<string, unknown> = {};
    circularObj.self = circularObj;

    act(() => {
      result.current[1](circularObj);
    });

    // The state is still updated with the reference, but localStorage write fails gracefully
    expect(result.current[0]).toBe(circularObj);
    expect(console.warn).toHaveBeenCalledWith(
      'Error setting localStorage key "testKey":',
      expect.any(TypeError)
    );
  });

  it('clears state when clear_ui_state event is dispatched', () => {
    window.localStorage.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('storedValue');

    act(() => {
      window.dispatchEvent(new Event('clear_ui_state'));
    });

    expect(result.current[0]).toBe('defaultValue');
    expect(window.localStorage.getItem('testKey')).toBeNull();
  });
});
