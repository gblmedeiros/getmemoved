package com.gmmoved.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionDTO {
	
	private String question;
	private String answer;
	
	public QuestionDTO(@JsonProperty("question") String question, @JsonProperty("answer") String answer) {
		super();
		this.question = question;
		this.answer = answer;
	}
	public String getQuestion() {
		return question;
	}
	public String getAnswer() {
		return answer;
	}
	
	
}
