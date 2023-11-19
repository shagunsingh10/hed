import { Table } from "antd";
import { RefTable } from "antd/es/table/interface";
import { useState, useLayoutEffect, useRef } from "react";

const CustomTable: RefTable = (props) => {
  const [tableHeight, setTableHeight] = useState(600);
  // ref is the Table ref.
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let height = window.innerHeight;
    const node = ref.current;
    const nodeBounds = node?.getBoundingClientRect();
    height -= nodeBounds?.top || 0;
    height -= 55; // header
    if (props.footer) height -= 48; // footer
    setTableHeight(height);
  }, [ref, window]);

  console.log({ tableHeight });

  return <Table ref={ref} scroll={{ y: tableHeight }} {...props} />;
};

export default CustomTable;
