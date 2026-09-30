import * as React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface LeaveRequestEmailProps {
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  days: number;
}

export const LeaveRequestEmail = ({
  employeeName,
  leaveType,
  startDate,
  endDate,
  reason,
  days,
}: LeaveRequestEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Leave Request from {employeeName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Leave Request</Heading>
          <Text style={text}>
            <strong>{employeeName}</strong> has requested {days} day(s) of {leaveType}.
          </Text>
          <Section style={section}>
            <Text style={text}>
              <strong>Start Date:</strong> {startDate.toLocaleDateString()}
            </Text>
            <Text style={text}>
              <strong>End Date:</strong> {endDate.toLocaleDateString()}
            </Text>
            <Text style={text}>
              <strong>Reason:</strong> {reason}
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Please review this request in the BuildOrbit HR Dashboard.
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

const section = {
  padding: "0 24px",
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
