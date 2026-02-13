import { Layout } from 'antd';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'; // 修改这里：BrowserRouter → HashRouter
// SideMenu removed - homepage will be full width
import BookReader from './pages/BookReader';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="app-container">
        {/* header removed for H5 reader */}
        <Layout className="app-layout">
          <Content className="app-content">
              <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/reader" element={<BookReader />} />
              </Routes>
            </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;