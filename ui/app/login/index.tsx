import { Button, Row, Col } from "antd";
import { signIn } from "next-auth/react";
import { GoogleOutlined } from "@ant-design/icons";
import Image from "next/image";
import styles from "./login.module.scss";

export default function LoginScreen() {
  return (
    <div>
      <Row className={styles.loginContainer}>
        <Col span={16}>
          <Image src={"/login-banner.jpg"} alt="login banner" layout="fill" />
        </Col>
        <Col span={8} className={styles.content}>
          <div className={styles.loginText}>Login to Herald</div>
          <Button block onClick={() => signIn("google")} type="primary">
            <GoogleOutlined />
            Sign in with Google
          </Button>
        </Col>
      </Row>
    </div>
  );
}
