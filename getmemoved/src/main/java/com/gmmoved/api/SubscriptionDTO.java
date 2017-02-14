package com.gmmoved.api;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SubscriptionDTO {

	private String name;
	private String email;
	
	private List<QuestionDTO> questions;
	
	public SubscriptionDTO(@JsonProperty("name") String name, @JsonProperty("email")String email, @JsonProperty("questions") List<QuestionDTO> questions) {
		super();
		this.name = name;
		this.email = email;
		this.questions = questions;
	}
	
	public String getEmail() {
		return email;
	}
	
	public String getName() {
		return name;
	}

	public List<QuestionDTO> getQuestions() {
		return questions;
	}

}
