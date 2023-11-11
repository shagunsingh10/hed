import { useEffect, useMemo, useState } from "react";
import { Space, Table, Tag, Input, message } from "antd";
import useStore from "@/store";
import { DeleteOutlined } from "@ant-design/icons";
import styles from "./asset.module.scss";
import { PRIMARY_COLOR } from "@/constants";

import type { ColumnsType } from "antd/es/table";
import type { Kg } from "@/types/kgs";
import Link from "next/link";

type KgListProps = {
  projectId: string;
};

const KgList: React.FC<KgListProps> = ({ projectId }) => {
  const kgs = useStore((state) => state.kgs);
  const getKgs = useStore((state) => state.getKgs);

  const [dataSource, setDataSource] = useState(kgs);
  const [value, setValue] = useState("");

  const FilterByNameInput = (
    <Space>
      Name
      <Input
        placeholder="Search Asset"
        value={value}
        onChange={(e) => {
          const currValue = e.target.value;
          setValue(currValue);
          const filteredData = kgs.filter((entry) =>
            entry.name.includes(currValue)
          );
          setDataSource(filteredData);
        }}
      />
    </Space>
  );

  const deleteKg = (kgId: string) => {
    message.info("Delete feature coming soon...");
  };

  const columns: ColumnsType<Kg> = useMemo(
    () => [
      {
        title: FilterByNameInput,
        dataIndex: "name",
        key: "name",
        render: (_, record) => (
          <Link
            href={`/projects/${projectId}/kgs/${record.id}`}
            style={{ color: PRIMARY_COLOR, fontWeight: "bold" }}
          >
            {record.name}
          </Link>
        ),
      },
      {
        title: "Tags",
        dataIndex: "tags",
        key: "tags",
        render: (_, { tags }) => (
          <>
            {tags?.map((tag) => {
              let color = tag.length > 5 ? "geekblue" : "green";
              return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              );
            })}
          </>
        ),
      },
      {
        title: "Created By",
        dataIndex: "createdBy",
        key: "createdBy",
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        width: "10%",
        render: (_, record) => (
          <Space>
            <DeleteOutlined
              color="primary"
              style={{ cursor: "pointer" }}
              onClick={() => deleteKg(record.id)}
            />
          </Space>
        ),
      },
    ],
    [deleteKg, FilterByNameInput]
  );

  useEffect(() => {
    if (getKgs) getKgs(projectId);
  }, [getKgs]);

  useEffect(() => setDataSource(kgs), [kgs]);

  return (
    <Table
      className={styles.kgList}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ y: 480 }}
    />
  );
};

export default KgList;
