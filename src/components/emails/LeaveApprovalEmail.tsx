import * as React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,

  Text,
} from "@react-email/components";

interface LeaveApprovalEmailProps {
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: "APPROVED" | "REJECTED";
}

export const LeaveApprovalEmail = ({
  employeeName,
  leaveType,
  startDate,
  endDate,
  status,
}: LeaveApprovalEmailProps) => {
  const isApproved = status === "APPROVED";
  return (
    <Html>
      <Head />
      <Preview>Your Leave Request has been {isApproved ? "Approved" : "Rejected"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Leave Request {isApproved ? "Approved" : "Rejected"}</Heading>
          <Text style={text}>
            Hello <strong>{employeeName}</strong>,
          </Text>
          <Text style={text}>
            Your request for {leaveType} from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()} has been {isApproved ? "approved" : "rejected"}.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            For any questions, please contact the HR department.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 24px",
};

const text = {
  color: "#333",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  padding: "0 24px",
};
