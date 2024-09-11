import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import PostPage from '../src/pages/r/[sub]/[identifier]/[slug]';
import { useRouter } from 'next/router';
import { useAuthState } from '@/src/context/auth';

// Mock axios and next/router
jest.mock('axios');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../src/context/auth');

// SWR 모킹
jest.mock('swr', () => {
  return jest.fn(() => ({
    data: {
      body: 'Test post body',
      identifier: 'testIdentifier',
      slug: 'testSlug',
      comments: [],
      title: 'Test Title',
      subName: 'testSub',
      username: 'testUser',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: '/r/testSub/testIdentifier/testSlug',
      userVote: 0,
      voteScore: 1,
      commentCount: 0,
    },
    error: null,
    mutate: jest.fn(),
    isValidating: false,
    isLoading: false,
  }));
});

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseAuthState = useAuthState as jest.MockedFunction<typeof useAuthState>;

describe('PostPage', () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { sub: 'testSub', identifier: 'testIdentifier', slug: 'testSlug' },
    } as any);

    mockedUseAuthState.mockReturnValue({
      authenticated: true,
      user: { username: 'testUser' },
    } as any);

    // 전역 fetch 함수 모의
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ choices: [{ message: { content: 'Mocked AI response' } }] }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('AI 답변 생성 버튼이 잘 동작하는가?', async () => {
    const mockResponse = { data: 'AI generated response' };
    (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<PostPage />);

    // 컴포넌트가 제대로 렌더링되었는지 확인
    expect(screen.getByText('Test post body')).toBeInTheDocument();

    // 'AI 답변 생성' 버튼 클릭
    const aiButton = await screen.findByText('AI 답변 생성');
    userEvent.click(aiButton);

    // API 호출
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/generate-ai-response/testIdentifier/testSlug', { prompt: 'Test post body' });
    });

    // AI 답변 잘 출력되는지 확인
    expect(await screen.findByText('AI 답변:')).toBeInTheDocument();
    expect(await screen.findByText('AI generated response')).toBeInTheDocument();
  });
});