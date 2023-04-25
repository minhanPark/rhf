import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

let renderCount = 0;

type FormValues = {
  username: string;
  email: string;
  channel: string;
  social: {
    twitter: string;
    facebook: string;
  };
  phoneNumbers: string[];
  phNumbers: {
    number: string;
  }[];
};

export const YouTubeForm = () => {
  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      channel: "",
      social: {
        twitter: "",
        facebook: "",
      },
      phoneNumbers: ["", ""],
      phNumbers: [{ number: "" }],
    },
  });
  const { register, control, handleSubmit, formState, reset, watch } = form;
  const { errors, isDirty } = formState;

  const { fields, append, remove } = useFieldArray({
    name: "phNumbers",
    control,
  });
  const onSubmit = (data: FormValues) => {
    console.log("form submitted", data);
  };

  // useEffect(() => {
  //   fetch("https://jsonplaceholder.typicode.com/users/1")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const arr = {
  //         username: data.username,
  //         email: data.email,
  //         channel: data.company.name,
  //       };
  //       reset(arr);
  //     });
  // }, []);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);
  renderCount++;
  return (
    <div>
      <h1>Youtube form ({renderCount / 2})</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          {...register("username", { required: "USername is required" })}
        />
        <p className="error">{errors.username?.message}</p>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          id="email"
          {...register("email", {
            pattern: {
              value:
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              message: "Invalid email format",
            },
            validate: (fieldValue) => {
              return (
                fieldValue !== "admin@example.com" || "Enter a differnet email"
              );
            },
          })}
        />
        <p className="error">{errors.email?.message}</p>
        <label htmlFor="channel">Channel</label>
        <input
          type="text"
          id="channel"
          {...register("channel", {
            required: { value: true, message: "Channel is required" },
            validate: {
              notAdmin: (fieldValue) => {
                return (
                  !fieldValue.includes("admin") ||
                  "Channel cannot include admin"
                );
              },
              notBlackListed: (fieldValue) =>
                ["blacklist", "badword"].every(
                  (word) => !fieldValue.includes(word)
                ) || "Channel cannot include blacklisted words",
            },
          })}
        />
        <p className="error">{errors.channel?.message}</p>

        <label htmlFor="twitter">Twitter</label>
        <input type="text" id="twitter" {...register("social.twitter")} />
        <label htmlFor="facebook">Facebook</label>
        <input type="text" id="facebook" {...register("social.facebook")} />

        <div className="form-control">
          <label htmlFor="primary-phone">Primary phone number</label>
          <input
            type="text"
            id="primary-phone"
            {...register("phoneNumbers.0")}
          />
        </div>
        <div className="form-control">
          <label htmlFor="secondary-phone">Secondary phone number</label>
          <input
            type="text"
            id="secondary-phone"
            {...register("phoneNumbers.1")}
          />
        </div>

        <div>
          <label>List of phone numbers</label>
          <div>
            {fields.map((field, index) => (
              <div className="form-control" key={field.id}>
                <input type="text" {...register(`phNumbers.${index}.number`)} />
                {index > 0 && (
                  <button type="button" onClick={() => remove(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => append({ number: "" })}>
              Add phone number
            </button>
          </div>
        </div>
        <button disabled={!isDirty}>Submit</button>
      </form>
      <DevTool control={control} />
    </div>
  );
};
