import { Layout } from 'antd';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'; // 修改这里：BrowserRouter → HashRouter
import SideMenu from './components/SideMenu';
import BookReader from './pages/BookReader';

const { Content, Sider } = Layout;

function App() {
  return (
    <Router>
      <Layout className="app-container">
        {/* header removed for H5 reader */}
        <Layout className="app-layout">
          <Sider className="app-sider" width={200}>
            <SideMenu />
          </Sider>
          <Layout>
            <Content className="app-content">
              <Routes>
                <Route path="/" element={<BookReader />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;