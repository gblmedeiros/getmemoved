package com.gmmoved.api;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionsSubmissionDTO {

	private SubscriptionDTO subscription;
	private List<QuestionDTO> questions;
	
	public QuestionsSubmissionDTO(@JsonProperty("subscription") SubscriptionDTO subscription, @JsonProperty("questions") List<QuestionDTO> questions) {
		super();
		this.subscription = subscription;
		this.questions = questions;
	}

	public SubscriptionDTO getSubscription() {
		return subscription;
	}

	public List<QuestionDTO> getQuestions() {
		return questions;
	}
	
	
}
