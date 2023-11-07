import { Button } from "antd";
import { signIn } from "next-auth/react";
import styles from "./login.module.scss";
import { GoogleOutlined } from "@ant-design/icons";

export default function LoginScreen() {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginText}>Login to K Base</div>
      <Button type="primary" onClick={() => signIn()}>
        <GoogleOutlined />
        Login with Google
      </Button>
    </div>
  );
}
