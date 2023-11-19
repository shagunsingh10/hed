import React from "react";
import { Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomTable from "@/components/Table";
import type { ColumnsType } from "antd/es/table";

interface DataType {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    width: "10%",
    render: (_, record) => (
      <Space size="middle">
        <EditOutlined style={{ cursor: "pointer" }} />
        <DeleteOutlined style={{ cursor: "pointer" }} />
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    id: "abc123",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    role: "Contributor",
  },
  {
    id: "def456",
    name: "Bob Smith",
    email: "bob.s@example.com",
    role: "Viewer",
  },
  {
    id: "ghi789",
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    role: "Owner",
  },
  {
    id: "jkl012",
    name: "David Miller",
    email: "david.m@example.com",
    role: "Contributor",
  },
  {
    id: "mno345",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "Viewer",
  },
  {
    id: "pqr678",
    name: "Frank White",
    email: "frank.w@example.com",
    role: "Contributor",
  },
  {
    id: "stu901",
    name: "Grace Taylor",
    email: "grace.t@example.com",
    role: "Viewer",
  },
  {
    id: "vwx234",
    name: "Henry Lee",
    email: "henry.l@example.com",
    role: "Owner",
  },
  {
    id: "yza567",
    name: "Iris Chen",
    email: "iris.c@example.com",
    role: "Contributor",
  },
  {
    id: "bcd890",
    name: "Jack Wilson",
    email: "jack.w@example.com",
    role: "Viewer",
  },
];

const KgUsers: React.FC = () => (
  <CustomTable columns={columns} dataSource={data} pagination={false} />
);

export default KgUsers;
