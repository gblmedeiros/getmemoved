package com.gmmoved.api;

import java.util.Properties;

import javax.annotation.ManagedBean;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

@ManagedBean
public class SendGmailEmail {

	private volatile static Properties emailProps = null;
	private static Session getMailSession;
	private static MimeMessage generateMailMessage;

	public SendGmailEmail() {
		// Configure email props
		emailProps = System.getProperties();
		emailProps.put("mail.smtp.port", "587");
		emailProps.put("mail.smtp.auth", "true");
		emailProps.put("mail.smtp.starttls.enable", "true");
	}
	
	/**
	 * Send an email to user.
	 * It receives the email body
	 * @param subscription
	 * @param emailBody
	 * @throws MessagingException
	 */
	public void send(final SubscriptionDTO subscription, String emailBody) throws MessagingException {
		
		// build email
		getMailSession = Session.getDefaultInstance(emailProps, null);
		generateMailMessage = new MimeMessage(getMailSession);
		generateMailMessage.addRecipient(Message.RecipientType.TO, new InternetAddress(subscription.getEmail()));

		generateMailMessage.setFrom("gabriel.fehn@gmail.com");
		generateMailMessage.setSubject("Greetings from Get Me Moved");

		generateMailMessage.setContent(emailBody.toString(), "text/html");

		// Acquire connection
		Transport transport = getMailSession.getTransport("smtp");

		// Enter your correct gmail UserID and Password
		// if you have 2FA enabled then provide App Specific Password
		transport.connect("smtp.gmail.com", "email@gmail.com", "password");
		transport.sendMessage(generateMailMessage, generateMailMessage.getAllRecipients());
		transport.close();
	}

	public static void main(String[] args) {
		SubscriptionDTO s = new SubscriptionDTO("Gabriel", "gabriel.fehn@gmail.com", null);
		try {
			new SendGmailEmail().send(s, "");
		} catch (Exception e) {
			e.printStackTrace();
		}
		System.exit(0);
	}
}
