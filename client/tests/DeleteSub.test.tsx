import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../src/components/Sidebar';
import { useAuthState } from '../src/context/auth';
import { useRouter } from 'next/router';
import axios from 'axios';
import '@testing-library/jest-dom';
import { Sub } from '../src/types';

// Mock the useAuthState hook to simulate authentication state
jest.mock('../src/context/auth');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('axios');

const mockedUseAuthState = useAuthState as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;
const mockedAxiosDelete = axios.delete as jest.Mock;

const mockSub: Sub = {
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  name: "testSub",
  title: "Test Sub",
  description: "for testing",
  imageUrn: "test.jpg",
  bannerUrn: "banner.jpg",
  username: "testUser",
  posts: [],
  imageUrl: "",
  bannerUrl: ""  
};

const mockUser = {
  username: 'testUser',
};

// 테스트들의 초기 상태 정의
beforeEach(() => {
  mockedUseAuthState.mockReturnValue({
    authenticated: true,
    user: mockUser,
    loading: false,
  });

  mockedUseRouter.mockReturnValue({
    push: jest.fn(),
  });

  mockedAxiosDelete.mockResolvedValue({});

  jest.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  jest.restoreAllMocks(); // 모든 모의(mock) 객체와 스파이를 원래 상태로 복원
});

describe('delete button', () => {
  test('사용자가 생성한 커뮤니티인 경우 커뮤니티 삭제 버튼이 보이는가?', () => {
    render(<Sidebar sub={mockSub} />);
  
    const deleteButton = screen.getByText('커뮤니티 삭제');
    expect(deleteButton).toBeInTheDocument();
  });

  test('사용자가 로그인되지 않은 경우 커뮤니티 삭제 버튼이 보이지 않는가?', () => {
    // Mock the user not being authenticated
    mockedUseAuthState.mockReturnValueOnce({
      authenticated: false,
      user: null,
      loading: false,
    });
  
    render(<Sidebar sub={mockSub} />);
  
    expect(screen.queryByText('커뮤니티 삭제')).not.toBeInTheDocument();
  });
})

describe('deleteSub', () => {
  test('커뮤니티 삭제 버튼이 잘 동작하는가?', async () => {
    const mockRouterPush = jest.fn();
    mockedUseRouter.mockReturnValueOnce({ push: mockRouterPush });
  
    render(<Sidebar sub={mockSub} />); 
  
    const deleteButton = screen.getByText('커뮤니티 삭제');
    fireEvent.click(deleteButton);
  
     // axios.delete가 올바른 경로로 호출되었는지 확인
    expect(mockedAxiosDelete).toHaveBeenCalledWith(`/subs/${mockSub.name}`);
  
    // router.push가 호출되었는지 확인
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });  
})