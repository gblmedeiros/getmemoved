package com.gmmoved.model;

import org.springframework.data.annotation.Id;

public class Question {

	@Id
    public String id;
	private String question;
	private String answer;
	
	public Question(String question, String answer) {
		super();
		this.question = question;
		this.answer = answer;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}
	

	
}
