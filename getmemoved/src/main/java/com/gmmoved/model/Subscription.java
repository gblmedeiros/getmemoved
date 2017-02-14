package com.gmmoved.model;

import java.util.List;

import org.springframework.data.annotation.Id;

public final class Subscription {

	@Id
    public String id;
	private String name;
	private String email;
	
	private List<Question> questions;
	
	public Subscription(String name, String email) {
		super();
		this.name = name;
		this.email = email;
	}
	
	public String getEmail() {
		return email;
	}
	
	public String getName() {
		return name;
	}

	public List<Question> getQuestions() {
		return questions;
	}

	public void setQuestions(List<Question> questions) {
		this.questions = questions;
	}
	
}
