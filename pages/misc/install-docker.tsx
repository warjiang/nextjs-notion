import { Select, Space, Tag } from '@arco-design/web-react';
import { useMemo, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

const registries = [
  {
    name: '阿里云',
    value: 'https://mirrors.aliyun.com',
    internal: false,
  },
  {
    name: '腾讯云',
    value: 'https://mirrors.tencent.com',
    internal: false,
  },
  {
    name: '火山引擎',
    value: 'https://mirrors.volces.com',
    internal: false,
  },
  {
    name: '火山引擎',
    value: 'https://mirrors.ivolces.com',
    internal: true,
  },
  {
    name: '中科大',
    value: 'https://mirrors.ustc.edu.cn',
    internal: false,
  }
]

const oses = [
  {
    name: 'debian',
    value: 'debian',
  },
  {
    name: 'ubuntu',
    value: 'ubuntu',
  },
  {}
]

const DockerRegistries = [
  {
    name: '中科大',
    value: 'https://ustc-edu-cn.mirror.aliyuncs.com',
    defaultEnable: true,
  },
  {
    name: '南京大学',
    value: 'https://docker.nju.edu.cn',
    defaultEnable: true,
  },
  {
    name: '网易',
    value: 'https://hub-mirror.c.163.com',
    defaultEnable: true,
  },
  {
    name: '百度',
    value: 'https://mirror.baidubce.com',
    defaultEnable: true,
  },
  {
    name: 'github',
    value: 'https://ghcr.io',
    defaultEnable: false,
  },
]

const InstallDockerPage = () => {
  const [cfg, setCfg] = useState<{
    os: string,
    mirror: string,
    dockerRegistries: string[],
  }>(() => {
    return {
      os: 'debian',
      mirror: 'https://mirrors.aliyun.com',
      dockerRegistries: DockerRegistries.filter(item => item.defaultEnable).map(item => item.value)
    }
  });
  const { os, mirror, dockerRegistries } = cfg;

  const configCode = `curl -fsSL ${mirror}/docker/linux/${os}/gpg | sudo apt-key add -
sudo add-apt-repository  "deb [arch=$(dpkg --print-architecture)] ${mirror}/docker/linux/${os} $(lsb_release -cs) stable"
`;
  const installCode = `sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# 指定docker版本
sudo apt-cache madison docker-ce
sudo apt-get install docker-ce=<VERSION_STRING> docker-ce-cli=<VERSION_STRING> containerd.io
`
  const registyStr = "\t" + dockerRegistries.map(item => `"${item}"`).join(",\n\t\t");
  const dockerConfigCode = `sudo usermod -aG docker \${USER}
mkdir -p /etc/docker/
sudo tee -a /etc/docker/daemon.json << EOF
{
    "registry-mirrors": [
      ${registyStr}
    ]
}
EOF

sudo systemctl restart docker
`

  const osOptions = useMemo(() => {
    return oses.map(item => {
      return {
        label: item.name,
        value: item.value,
      }
    })
  }, [oses])

  const dockerOptions = useMemo(() => {
    return DockerRegistries.map(item => {
      return {
        label: item.name,
        value: item.value,
      }
    })
  }, [dockerRegistries])
  return (
    <div className="container mx-auto mt-[60px]">
      <Space direction='vertical'>
        <Space direction='horizontal' className={'w-full'}>
          <div className='w-[200px]'>
            <Select
              value={mirror}
              onChange={(v: string) => {
                setCfg({
                  ...cfg,
                  mirror: v
                })
              }}
            >
              {
                registries.map(item => {
                  return <Select.Option value={item.value} key={item.value}>
                    <div>
                      <span className='mr-2'>{item.name}</span>
                      {item.internal && <Tag size='small' color='arcoblue'>内网</Tag>}
                    </div>
                  </Select.Option>
                })
              }
            </Select>
          </div>
          <div className='w-[200px]'>
            <Select
              value={os}
              options={osOptions}
              onChange={(v: string) => {
                setCfg({
                  ...cfg,
                  os: v
                })
              }}
            />
          </div>
        </Space>
        {/* 配置源信息 */}
        <div>
          <h2 className='text-xl mb-2'>系统源配置:</h2>
          <SyntaxHighlighter language="bash" style={docco}>
            {configCode}
          </SyntaxHighlighter>
        </div>
        {/* 安装 Docker */}
        <div>
          <h2 className='text-xl mb-2'>安装:</h2>
          <SyntaxHighlighter language="bash" style={docco}>
            {installCode}
          </SyntaxHighlighter>
        </div>
        {/* 安装 Docker */}
        <div>
          <h2 className='text-xl mb-2'>Docker配置:</h2>
          <div className='max-w-[25%] mb-2'>
            <Select
              options={dockerOptions}
              mode='multiple'
              maxTagCount={3}
              value={dockerRegistries}
              onChange={(v:string[]) => {
                setCfg({
                  ...cfg,
                  dockerRegistries: v
                })
              }}
            />
          </div>
          <SyntaxHighlighter language="bash" style={docco}>
            {dockerConfigCode}
          </SyntaxHighlighter>
        </div>
      </Space>

    </div>
  );
};


export default InstallDockerPage;
